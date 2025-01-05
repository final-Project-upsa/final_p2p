from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse 
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required 
from django.contrib.auth import authenticate, login, logout 
from django.contrib.auth.models import User 
from django.views.decorators.csrf import csrf_protect, csrf_exempt, ensure_csrf_cookie
from django.contrib import messages 
from django.http import HttpResponseRedirect 
from django.utils.http import url_has_allowed_host_and_scheme 
from django.urls import reverse 
from django.views.decorators.cache import never_cache 
from .models import Product, Seller, Message, Chat, UserProfile, Category, Order, OrderItem, OrderUpdate, CustomUser, ChatNotification
from django.db.models import Sum, Count
from .forms import ProductForm, SellerRegister, CustomRegisterForm
from django.db.models import Q, F, Prefetch
import json
from django.utils.decorators import method_decorator
from django.utils import timezone


from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .serializers import ProductSerializer, UsercreateSerializer, CategorySerializer, SellerSerializer, CustomUserSerializer, LoginSerializer, UserProfileSerializer, OrderSerializer, OrderItemSerializer, OrderUpdateSerializer, ChatSerializer, MessageSerializer
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes



class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Chat.objects.filter(
            participants=self.request.user,
            is_active=True
        ).prefetch_related(
            'participants',
            Prefetch(
                'messages',
                queryset=Message.objects.order_by('-timestamp'),
                to_attr='last_message_prefetch'
            ),
            'product',
            'product__seller'
        ).order_by('-last_message_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['current_user'] = self.request.user
        return context

    def retrieve(self, request, *args, **kwargs):
        try:
            # Changed to use filter() first, then get() to properly handle ManyToMany relationship
            instance = Chat.objects.filter(
                participants=request.user,
                is_active=True
            ).get(id=kwargs.get('pk'))
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Chat.DoesNotExist:
            return Response(
                {'error': 'Chat not found or you do not have access'},
                status=status.HTTP_404_NOT_FOUND
            )

    def create(self, request):
        other_user_id = request.data.get('other_user_id')
        product_id = request.data.get('product_id')
        chat_type = request.data.get('chat_type', 'purchase')

        # Validate input
        if not other_user_id:
            return Response(
                {'error': 'Other user ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            other_user = CustomUser.objects.get(id=other_user_id)
            if product_id:
                product = Product.objects.get(id=product_id)
                # Verify product belongs to the other user if they're the seller
                if chat_type == 'purchase' and product.seller.id != other_user.id:
                    return Response(
                        {'error': 'Invalid seller for this product'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                product = None

        except (CustomUser.DoesNotExist, Product.DoesNotExist):
            return Response(
                {'error': 'User or product not found'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for existing chat
        existing_chat = Chat.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user,
            product_id=product_id,
            chat_type=chat_type,
            is_active=True
        ).first()

        if existing_chat:
            serializer = self.get_serializer(existing_chat)
            return Response(serializer.data)

        # Create new chat
        try:
            chat = Chat.objects.create(
                chat_type=chat_type,
                product=product
            )
            chat.participants.add(request.user, other_user)
            
            # Create initial system message
            Message.objects.create(
                chat=chat,
                sender=None,
                content=f"Chat started" + (f" for {product.name}" if product else ""),
                message_type='system'
            )
            
            serializer = self.get_serializer(chat)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        try:
            chat = self.get_queryset().get(pk=pk)
            messages = chat.messages.filter(
                read_by__contains=[],
                sender__ne=request.user.id
            )
            messages.update(
                read_by=F('read_by').concat([request.user.id])
            )
            return Response({'status': 'messages marked as read'})
        except Chat.DoesNotExist:
            return Response(
                {'error': 'Chat not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs.get('chat_pk')
        return Message.objects.filter(
            chat_id=chat_id,
            chat__participants=self.request.user
        ).select_related('sender').order_by('-timestamp')

    def perform_create(self, serializer):
        chat_id = self.kwargs.get('chat_pk')
        chat = Chat.objects.get(id=chat_id)
        
        message = serializer.save(
            sender=self.request.user,
            chat_id=chat_id
        )
        
        # Update chat's last_message_at
        chat.last_message_at = timezone.now()
        chat.save(update_fields=['last_message_at'])

def marketplacee(request):
    products = Product.objects.all()
    categories = Category.objects.all()

    # Filter by category
    category_slug = request.GET.get('category')
    if category_slug:
        products = products.filter(categories__slug=category_slug)

    # Search functionality
    query = request.GET.get('q')
    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(categories__name__icontains=query) 
        ).distinct()

    context = {
        'products': products,
        'categories': categories,
        'current_category': category_slug,
        'query': query
    }

    return render(request, 'p2p_site/marketplace.html', context)
#=====================api==========================================
@api_view(['GET'])
@permission_classes([AllowAny])
def marketplace(request):
    category_name = request.query_params.get('category', '')

    if category_name and category_name != 'All':
        try:
            category = Category.objects.get(name=category_name)
            products = Product.objects.filter(categories=category)
        except Category.DoesNotExist:
            products = Product.objects.none()
    else:
        products = Product.objects.all()

    categories = Category.objects.all()

    product_serializer = ProductSerializer(products, many=True, context={'request': request})
    category_serializer = CategorySerializer(categories, many=True)

    return Response({
        'products': product_serializer.data,
        'categories': category_serializer.data,
    })


@login_required
def enroll_seller(request):
    if request.method == 'POST':
        form = SellerRegister(request.POST, request.FILES)
        if form.is_valid():
            business_name = form.cleaned_data.get('business_name')
            if Seller.objects.filter(business_name=business_name).exists():
                form.add_error('business_name', 'A seller with this business name already exists.')
            else:
                seller = form.save(commit=False)
                seller.user = request.user  # Assign the logged-in user
                seller.save()
                return redirect('seller_dashboard', pk=seller.pk)
    else:
        form = SellerRegister()
    
    return render(request, 'p2p_site/enroll_seller.html', {'form': form})
#=======================api========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_seller1(request):
    if request.method == 'POST':
        serializer = SellerSerializer(data=request.data)
        if hasattr(request.user, 'seller'):
            return Response(
                {'message': 'You are already registered as a seller'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if serializer.is_valid():
            business_name = serializer.validated_data.get('business_name')
            
            # Check if seller already exists
            if Seller.objects.filter(business_name=business_name).exists():
                return Response(
                    {'error': 'A seller with this business name already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the seller with the current user
            seller = serializer.save(user=request.user)
            
            request.user.is_seller = True
            request.user.save(update_fields=['is_seller'])
            
            return Response({
                'message': 'Seller registered successfully.',
                'seller_id': seller.pk
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



def seller_dashboard(request, pk):
    seller = get_object_or_404(Seller, pk=pk)
    return render(request, 'p2p_site/seller_dashboard.html', {'seller': seller})
#===================api============================================
@api_view(['GET'])
def seller_dashboardd(request, pk):
    seller = get_object_or_404(Seller, pk=pk)

    # Get recent orders
    recent_orders = Order.objects.filter(seller=seller).order_by('-created_at')[:5]

    # Calculate revenue metrics
    total_revenue = Order.objects.filter(seller=seller, status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    # Get product stats
    total_products = Product.objects.filter(seller=seller).count()
    active_products = Product.objects.filter(seller=seller, is_active=True).count()
    products = Product.objects.filter(seller=seller)

    response_data = {
        'seller': SellerSerializer(seller, context={'request': request}).data,
        'recent_orders': OrderSerializer(recent_orders, many=True, context={'request': request}).data,
        'metrics': {
            'total_revenue': total_revenue,
            'total_products': total_products,
            'active_products': active_products,
            'total_orders': Order.objects.filter(seller=seller).count(),
        },
        'products': ProductSerializer(products, many=True, context={'request': request}).data,  # Serialize products
    }

    return Response(response_data)




def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'p2p_site/product_detail.html', {'product': product})
#=============================api==================================
@api_view(['GET'])
@permission_classes([AllowAny])
def product_detaill(request, pk):
    product = get_object_or_404(Product, pk=pk)
    product_serializer = ProductSerializer(product, context={'request': request})
    seller_data = SellerSerializer(product.seller).data if product.seller else None
    
    # Get the seller ID from serialized data
    seller_id = seller_data['id'] if seller_data else None
    
    # Return the response with both product and seller information
    return Response({
        'product': product_serializer.data,
        'seller_id': seller_id  # Include seller ID in the response
    })



@login_required
def add_product(request):
    try:
        seller = Seller.objects.get(user=request.user, is_approved=True)
    except Seller.DoesNotExist:
        messages.error(request, "You must be an approved seller to add products.")
        return redirect('marketplace')

    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            product.seller = seller
            product.save()
            form.save_m2m()  # save the categories
            messages.success(request, "Product added successfully!")
            return redirect('marketplace')
    else:
        form = ProductForm()

    return render(request, 'p2p_site/add_product.html', {'form': form})
#======================api=========================================
@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser]) 
def product_handler(request, pk=None):
    try:
        seller = Seller.objects.get(user=request.user, is_approved=True)
    except Seller.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'you need to be an approved seller to add new products'
        }, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'POST':
        print("Received files:", request.FILES)  # Debug print
        print("Received data:", request.data)    # Debug print
        
        # Get categories from the request data
        categories_data = request.data.get('categories')
        if categories_data:
            try:
                categories_ids = json.loads(categories_data)
            except json.JSONDecodeError:
                return Response({
                    'status': 'error',
                    'message': 'Invalid categories data'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        add_product_serializer = ProductSerializer(data=request.data)
        if add_product_serializer.is_valid():
            product = add_product_serializer.save(seller=seller)
            
            # Add categories to the product
            if categories_ids:
                product.categories.set(categories_ids)
            
            # Handle main image
            if 'main_image' in request.FILES:
                product.main_image = request.FILES['main_image']
            
            # Handle additional images
            for key in request.FILES:
                if key.startswith('image') and key != 'main_image':
                    index = key.replace('image', '')
                    if hasattr(product, f'image{index}'):
                        setattr(product, f'image{index}', request.FILES[key])
            
            product.save()
            
            return Response({
                'status': 'success',
                'message': 'Product Added Successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(add_product_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'DELETE':
        product = get_object_or_404(Product, id=pk)
        if product.seller != request.user.seller:
            return Response (
                {"error": "You Do Not Have Permission to Delete this Product"},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            product.delete()
            return Response(
                {"message": "Product deleted Successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Failed to Delete Product",
                 "details": str(e)
                },
            )
        

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        # Check if the logged-in user is the seller of this product
        if product.seller.user != request.user:
            return Response({
                'status': 'error',
                'message': 'You do not have permission to edit this product'
            }, status=status.HTTP_403_FORBIDDEN)
            
        if request.method == 'GET':
            serializer = ProductSerializer(product, context={'request': request})
            print("Serialized data:", serializer.data)
            return Response(serializer.data)
            
            
        elif request.method == 'PUT':
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                # Handle categories if provided
                categories_data = request.data.get('categories')
                if categories_data:
                    try:
                        categories_ids = json.loads(categories_data)
                        product.categories.set(categories_ids)
                    except json.JSONDecodeError:
                        return Response({
                            'status': 'error',
                            'message': 'Invalid categories data'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                # Handle images
                if 'main_image' in request.FILES:
                    product.main_image = request.FILES['main_image']
                
                for key in request.FILES:
                    if key.startswith('image') and key != 'main_image':
                        index = key.replace('image', '')
                        if hasattr(product, f'image{index}'):
                            setattr(product, f'image{index}', request.FILES[key])
                
                product = serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Product Updated Successfully'
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Product.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
        

    
    
# views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
    user = get_object_or_404(CustomUser, id=pk)
    
    # Serialize the user data
    user_data = CustomUserSerializer(user).data
    response_data = {'user_data': user_data}

    # Add seller-specific data if the user is a seller
    if user.is_seller and hasattr(user, 'seller'):
        seller_data = SellerSerializer(user.seller).data
        active_products = Product.objects.filter(seller=user.seller, is_active=True).count()
        seller_data['active_products'] = active_products
        response_data['user_seller_data'] = seller_data

    # Add user's orders
    user_orders = user.orders.all().order_by('-created_at')
    orders_data = OrderSerializer(user_orders, many=True).data
    response_data['user_orders'] = orders_data

    # Add user's chats
    user_chats = Chat.objects.filter(
        participants=user
    ).select_related('product').prefetch_related(
        'participants'
    ).order_by('-created_at')
    
    chats_data = ChatSerializer(
        user_chats, 
        many=True,
        context={'current_user': user}
    ).data
    response_data['user_chats'] = chats_data

    # Add unread messages/notifications
    unread_notifications = ChatNotification.objects.filter(
        recipient=user,
        is_read=False
    ).select_related('message', 'chat').order_by('-created_at')
    
    unread_messages = [{
        'id': notif.message.id,
        'chat_id': notif.chat.id,
        'content': notif.message.content,
        'sender_id': notif.message.sender.id,
        'sender_name': notif.message.sender.full_name or notif.message.sender.username,
        'timestamp': notif.message.timestamp.isoformat(),
        'product_name': notif.chat.product.name if notif.chat.product else None
    } for notif in unread_notifications]
    
    response_data['unread_messages'] = unread_messages

    return Response(response_data)

    

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def favorite_product(request, pk=None):
    user_profile = request.user.profile

    # Special case for sellers requesting analytics
    seller_analytics = request.query_params.get('seller_analytics')
    if seller_analytics and pk:
        product = get_object_or_404(Product, id=pk)
        
        # Check if the requesting user is the seller of this product
        if not hasattr(request.user, 'seller') or product.seller != request.user.seller:
            return Response({
                'status': 'error',
                'message': 'You do not have permission to view these analytics'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get all users who favorited this product
        favorited_users = UserProfile.objects.filter(favourites=product)
        
        # Create detailed analytics response
        analytics_data = {
            'total_favorites': favorited_users.count(),
            'unique_users': favorited_users.count(),
            'favorites_data': [{
                'user_id': profile.user.id,
                'created_at': profile.created_at.isoformat() if hasattr(profile, 'created_at') else None
            } for profile in favorited_users],
        }
        
        return Response(analytics_data)

    if request.method == 'GET':
        # Get all favorites for the current user
        favorites = user_profile.favourites.all()
        serializer = ProductSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    # For both POST and DELETE, get the product first
    product = get_object_or_404(Product, id=pk)
        
    if request.method == 'POST':
        # Add to favorites
        user_profile.favourites.add(product)
        return Response({'status': 'added'})
        
    elif request.method == 'DELETE':
        # Remove from favorites
        user_profile.favourites.remove(product)
        return Response({'status': 'removed'})
    
    
    
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def carts(request, pk=None):
    user_profile = request.user.profile

    if request.method == 'GET':
        # Get all cart for the current user
        favorites = user_profile.carts.all()
        serializer = ProductSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    # For both POST and DELETE, get the product first
    product = get_object_or_404(Product, id=pk)
        
    if request.method == 'POST':
        # Add to carts
        user_profile.carts.add(product)
        return Response({'status': 'added'})
        
    elif request.method == 'DELETE':
        # Remove from carts
        user_profile.carts.remove(product)
        return Response({'status': 'removed'})
    
    

def homepage(request):
    products = Product.objects.all()
    return render(request, 'p2p_site/index.html', {'products': products})




#API endpoint for search suggestions
def search_suggestions(request):
    query = request.GET.get('q', '')
    if len(query) > 2:
        suggestions = list(Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(categories__name__icontains=query)
        ).values_list('name', flat=True).distinct()[:5])  # Lmit to only5 suggestions
        
        # Add category suggestions
        category_suggestions = list(Category.objects.filter(name__icontains=query).values_list('name', flat=True)[:3])
        suggestions.extend(category_suggestions)
        
        return JsonResponse({'suggestions': suggestions})
    return JsonResponse({'suggestions': []})



@csrf_exempt
@require_POST
@login_required
def save_favourite(request):
    try:
        data = json.loads(request.body)
        product_id = data.get('productId')
        is_favourite = data.get('isFavourite')

        product = Product.objects.get(id=product_id)
        user_profile = UserProfile.objects.get(user=request.user)

        if is_favourite:
            user_profile.favourites.add(product)
            message = "Product added to favourites."
        else:
            user_profile.favourites.remove(product)
            message = "Product removed from favourites."

        new_count = user_profile.favourites.count()
        return JsonResponse({"success": True, "message": message, "newCount": new_count})
    except Product.DoesNotExist:
        return JsonResponse({"success": False, "message": "Product not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
    


@login_required
def get_user_favourites(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        favourite_products = list(user_profile.favourites.values_list('id', flat=True))
        return JsonResponse({"success": True, "favourites": favourite_products})
    except UserProfile.DoesNotExist:
        return JsonResponse({"success": False, "message": "User profile not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
    
    

@login_required
def all_favorites(request):
    user_profile = UserProfile.objects.get(user=request.user)
    favorites = user_profile.favourites.all()
    return render(request, 'p2p_site/favorites.html', {'favorites': favorites})
#=====================api=======================================
  

@login_required
def get_product_details(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        return JsonResponse({
            "success": True,
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "main_image_url": product.main_image.url if product.main_image else None,
            "seller_id": product.seller.id,
            "is_seller": request.user == product.seller.user
        })
    except Product.DoesNotExist:
        return JsonResponse({"success": False, "message": "Product not found."}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)
#================api========================================
@api_view(['GET'])
def get_products_deets(request, product_id):
    prod = Product.objects.get(id=product_id)
    return Response({'name': prod.name, 'price': prod.price, 'image': prod.main_image})


def seller_shop(request, username):
    seller = get_object_or_404(Seller, business_name=username)
    products = Product.objects.filter(seller=seller)
    return render(request, 'p2p_site/seller_shop.html', {'seller': seller, 'products': products})




@csrf_protect
def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            next_url = request.POST.get('next') or reverse('marketplace')
            return JsonResponse({'status': 'success', 'redirect': next_url})
        else:
            return JsonResponse({'status': 'error', 'message': "Invalid username or password. Please try again."})
    
    # Handle GET request
    next_url = request.GET.get('next', reverse('marketplace'))
    return render(request, 'p2p_site/index.html', {'next': next_url})
#===================api=====================================
@api_view(['POST'])
def login_api(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')
        user = authenticate(request, username=username, password=password)
        
    if user is not None:
        login(request, user)
        return Response({'status': 'success', 'message': 'Login Successful'})
    else:
        return Response({'status': 'error', 'message': 'Invalid username or password. Please try again.'})
        


@csrf_protect
def register(request):
    next_url = request.POST.get('next') or request.GET.get('next', 'marketplace')
    
    if request.method == 'POST':
        form = CustomRegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password1 = form.cleaned_data.get('password1')
            password2 = form.cleaned_data.get('password2')
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({'status': 'error', 'message': "This username is already taken. Please choose a different one."})
            elif User.objects.filter(email=email).exists():
                return JsonResponse({'status': 'error', 'message': "This email is already registered. Please use a different email."})
            elif password1 != password2:
                return JsonResponse({'status': 'error', 'message': "Passwords do not match. Please try again."})
            else:
                user = form.save()
                login(request, user)
                return JsonResponse({'status': 'success', 'redirect': next_url})
        else:
            errors = []
            for field, field_errors in form.errors.items():
                for error in field_errors:
                    errors.append(f"{field.capitalize()}: {error}")
            return JsonResponse({'status': 'error', 'message': ' '.join(errors)})
    else:
        form = CustomRegisterForm()
    
    return render(request, 'p2p_site/index.html', {'form': form, 'show_register_form': True, 'next': next_url})
##==================================api======================
@api_view(['POST'])
@csrf_protect
def register_api(request):
    serializer = CustomUserSerializer(data=request.data)

    if serializer.is_valid():
        username = serializer.validated_data.get('username')
        email = serializer.validated_data.get('email')

        if User.objects.filter(username=username).exists():
            return Response({
                'status': 'error',
                'message': "This username is already taken. Please choose a different one."
            }, status=status.HTTP_400_BAD_REQUEST)
        elif User.objects.filter(email=email).exists():
            return Response({
                'status': 'error',
                'message': "This email is already registered. Please use a different email."
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = serializer.save()
            login(request, user)
            return Response({"status": "success", "message": "User registered successfully"})
    else:
        errors = []
        for field, field_errors in serializer.errors.items():
            for error in field_errors:
                errors.append(f"{field.capitalize()}: {error}")
        return Response({
            'status': 'error',
            'message': ' '.join(errors)
        }, status=status.HTTP_400_BAD_REQUEST)



@never_cache
@login_required
def custom_logout(request):
    logout(request)
    return redirect('marketplace')




#==========================CHAT==============================

@login_required
def create_chat(request, seller_id, product_id):
    seller = get_object_or_404(Seller, id=seller_id)
    product = get_object_or_404(Product, id=product_id)
    
    # Check if chat session already exists
    chat, created = Chat.objects.get_or_create(buyer=request.user, seller=seller, product=product)
    
    return redirect('chat_room', chat_id=chat.id)

@login_required
def inbox(request):
    chats = Chat.objects.filter(Q(buyer=request.user) | Q(seller__user=request.user))
    return render(request, 'p2p_site/inbox.html', {'chats': chats})

@login_required
def chat_room(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    messages = chat.messages.all()
    
    if request.method == 'POST':
        content = request.POST.get('message')
        if content:
            message = Message.objects.create(chat=chat, sender=request.user, content=content)
            return JsonResponse({
                'status': 'success',
                'message': {
                    'content': message.content,
                    'sender': message.sender.username,
                    'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                }
            })
    
    return render(request, 'p2p_site/chat_room.html', {'chat': chat, 'messages': messages})


@login_required
def get_new_messages(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    last_message_id = request.GET.get('last_id')

    if last_message_id:
        last_message_id = int(last_message_id)  
    else:
        last_message_id = 0  

    new_messages = chat.messages.filter(id__gt=last_message_id)
    
    messages_data = [{
        'id': message.id,
        'content': message.content,
        'sender': message.sender.username,
        'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for message in new_messages]
    
    return JsonResponse({'messages': messages_data})

#===========================================================