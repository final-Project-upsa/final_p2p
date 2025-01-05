from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date
from django.conf import settings
from decimal import Decimal

def validate_age(value):
    today = date.today()
    age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
    if age < 18:
        raise ValidationError("You must be at least 18 years old.")

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        # Create UserProfile for the user
        UserProfile.objects.create(user=user)
        
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_seller = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be in format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def has_seller_profile(self):
        return hasattr(self, 'seller')
    
    def get_orders_as_buyer(self):
        """Returns orders where user is the buyer"""
        return self.orders.all()  # using the related_name from Order model

    def get_orders_as_seller(self):
        """Returns orders where user is the seller through their seller profile"""
        if hasattr(self, 'seller'):
            return self.seller.orders.all()
        return Order.objects.none()
    
#====================================================================================================



class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    region = models.TextField()
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    favourites = models.ManyToManyField('Product', related_name='favourited_by', blank=True)
    carts = models.ManyToManyField('Product', related_name='added_to_cart_by', blank=True)

    def __str__(self):
        return f"Profile for {self.user.username}"
    
class ProductCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    

def seller_directory_path(instance, filename):
    # upload file to MEDIA_ROOT/sellers/<username>/<filename>
    return f'sellers/{instance.user.username}/{filename}'

class Seller(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='seller')
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    DOB = models.DateField(null=True, blank=True, validators=[validate_age], help_text="You must be at least 18 years old to register as a seller")
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be in format: '+999999999'. Up to 15 digits allowed."
    )
    
    phone = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    business_name = models.CharField(max_length=255, unique=True)
    business_address = models.TextField()
    business_type = models.CharField(max_length=255, null=True, blank=True)
    business_hours = models.TextField(null=True, blank=True)
    postal_code = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    delivery_radius = models.CharField(max_length=255, null=True, blank=True)
    website = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    # product_categories = models.ManyToManyField(ProductCategory, related_name='seller')
    profile_photo = models.ImageField(upload_to=seller_directory_path)
    id_card = models.ImageField(upload_to=seller_directory_path)
    is_approved = models.BooleanField(default=True)
    region = models.CharField(max_length=255)

    def clean(self):
        if self.business_name:
            existing_seller = Seller.objects.filter(
                business_name__iexact=self.business_name
            ).exclude(pk=self.pk).exists()
            if existing_seller:
                raise ValidationError({'business_name': 'A seller with this business name already exists.'})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.business_name} ({self.user.username})"

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    
    class Meta:
        verbose_name_plural = "categories"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

def product_directory_path(instance, filename):
    path = f'sellers/{instance.seller.user.username}/products/{slugify(instance.name)}/{filename}'
    return path

class Product(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    main_image = models.ImageField(upload_to=product_directory_path)
    image1 = models.ImageField(upload_to=product_directory_path, blank=True, null=True)
    image2 = models.ImageField(upload_to=product_directory_path, blank=True, null=True)
    image3 = models.ImageField(upload_to=product_directory_path, blank=True, null=True)
    image4 = models.ImageField(upload_to=product_directory_path, blank=True, null=True)
    image5 = models.ImageField(upload_to=product_directory_path, blank=True, null=True)
    categories = models.ManyToManyField(Category, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True)
    regular_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (by {self.seller.business_name})"
    
    

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='orders')
    buyer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipping_address = models.TextField()
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.buyer.username} from {self.seller.business_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        unique_together = ('order', 'product')

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order #{self.order.id}"
    
    @property
    def subtotal(self):
        return self.quantity * self.unit_price

class OrderUpdate(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='updates')
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Update for Order #{self.order.id}: {self.status}"




#===================================================================================================================
class Chat(models.Model):
    CHAT_TYPES = [
        ('general', 'General Chat'),
        ('purchase', 'Purchase Discussion'),
        ('offer', 'Offer Discussion')
    ]

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='chats'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chats'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    chat_type = models.CharField(
        max_length=20,
        choices=CHAT_TYPES,
        default='general'
    )

    class Meta:
        ordering = ['-last_message_at']
        indexes = [
            models.Index(fields=['-last_message_at']),
            models.Index(fields=['is_active']),
        ]

    def get_other_participant(self, user):
        """Get the other participant in the chat."""
        return self.participants.exclude(id=user.id).first()

    def __str__(self):
        return f"Chat {self.id} - {self.chat_type}"



class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(
        CustomUser,
        null=True,
        on_delete=models.SET_NULL,
        related_name='sent_messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text Message'),
            ('system', 'System Message')
        ],
        default='text'
    )
    metadata = models.JSONField(null=True, blank=True, default=dict)  # Add this field

    class Meta:
        ordering = ['-timestamp']

class ChatNotification(models.Model):  # Add this new model
    recipient = models.ForeignKey('p2p_site.CustomUser', on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['recipient', 'message']