from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import CustomUser, UserProfile, Seller, Category, Product, Chat, Message, Order, OrderItem, OrderUpdate
from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UsercreateSerializer(DjoserUserCreateSerializer):
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = ['email', 'username', 'password', 're_password', 'first_name', 'last_name', 'phone_number', ]

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

class CustomUserSerializer(serializers.ModelSerializer):
    is_seller = serializers.BooleanField(read_only=True)
    has_seller_profile = serializers.BooleanField(read_only=True)
    seller_id = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                 'phone_number', 'is_seller', 'seller_id', 'has_seller_profile',]
        read_only_fields = ['id']

    def get_seller_id(self, obj):
        if hasattr(obj, 'seller'):
            return obj.seller.id
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    #region = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password2', 'first_name', 'last_name', 
                 'phone_number', ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # region = validated_data.pop('region')
        password2 = validated_data.pop('password2')
        
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', '')
        )

        # user.profile.region = region
        user.profile.save()

        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['slug']
        

class SellerSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    profile_photo = serializers.ImageField(required=False)

    class Meta:
        model = Seller
        fields = [
            'user', 'first_name', 'last_name', 'DOB', 'phone', 'business_name',
            'business_type', 'business_address', 'business_hours', 'city',
            'profile_photo', 'profile_photo_url', 'postal_code', 'delivery_radius',
            'website', 'description', 'id_card', 'is_approved', 'region'
        ]
        read_only_fields = ['is_approved']

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url  # Fallback for cases where `request` is not in context
        return None

    
    
##===================================================================================

class ProductSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    sale_price = serializers.FloatField(source='price')
    
    # URLs for image display (read-only)
    main_image_url = serializers.SerializerMethodField(read_only=True)
    image1_url = serializers.SerializerMethodField(read_only=True)
    image2_url = serializers.SerializerMethodField(read_only=True)
    image3_url = serializers.SerializerMethodField(read_only=True)
    image4_url = serializers.SerializerMethodField(read_only=True)
    image5_url = serializers.SerializerMethodField(read_only=True)
    
    # File fields for upload
    main_image = serializers.ImageField(required=True, write_only=True)
    image1 = serializers.ImageField(required=False, write_only=True, allow_null=True)
    image2 = serializers.ImageField(required=False, write_only=True, allow_null=True)
    image3 = serializers.ImageField(required=False, write_only=True, allow_null=True)
    image4 = serializers.ImageField(required=False, write_only=True, allow_null=True)
    image5 = serializers.ImageField(required=False, write_only=True, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'name', 'description', 'sale_price',
            'main_image', 'main_image_url',
            'image1', 'image1_url',
            'image2', 'image2_url',
            'image3', 'image3_url',
            'image4', 'image4_url',
            'image5', 'image5_url',
            'categories', 'created_at', 'is_active',
            'stock', 'regular_price'
        ]
        read_only_fields = ['created_at', 'seller']

    def get_main_image_url(self, obj):
        if obj.main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.main_image.url)
        return None

    def get_image1_url(self, obj):
        if obj.image1:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image1.url)
        return None

    def get_image2_url(self, obj):
        if obj.image2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image2.url)
        return None

    def get_image3_url(self, obj):
        if obj.image3:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image3.url)
        return None

    def get_image4_url(self, obj):
        if obj.image4:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image4.url)
        return None

    def get_image5_url(self, obj):
        if obj.image5:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image5.url)
        return None

    def validate_sale_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        return value

    def validate_stock(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        return value

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])
        product = Product.objects.create(**validated_data)
        
        # Handle categories if they were provided
        if categories_data:
            product.categories.set(categories_data)
            
        return product

    def update(self, instance, validated_data):
        # Update the product instance with the validated data
        for attr, value in validated_data.items():
            if attr != 'categories':
                setattr(instance, attr, value)
        
        instance.save()
        return instance
    
    
#==========================================================================


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['subtotal']

class OrderUpdateSerializer(serializers.ModelSerializer):
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = OrderUpdate
        fields = ['id', 'status', 'note', 'created_at', 'updated_by', 'updated_by_username']
        read_only_fields = ['created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    updates = OrderUpdateSerializer(many=True, read_only=True)
    buyer_name = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'seller', 'seller_name', 'buyer', 'buyer_name',
            'status', 'total_amount', 'created_at', 'updated_at',
            'shipping_address', 'tracking_number', 'items', 'updates'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_buyer_name(self, obj):
        return f"{obj.buyer.first_name} {obj.buyer.last_name}".strip() or obj.buyer.username

    def get_seller_name(self, obj):
        return obj.seller.business_name if obj.seller else ''


class UserProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    favourites = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'region', 'wallet_balance', 'favourites']
        read_only_fields = ['wallet_balance']

class ChatSerializer(serializers.ModelSerializer):
    buyer = CustomUserSerializer(read_only=True)
    seller = SellerSerializer(read_only=True)
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'buyer', 'seller', 'product', 'created_at']
        read_only_fields = ['created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = CustomUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'timestamp', 'is_read']
        read_only_fields = ['timestamp']