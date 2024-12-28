from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django import forms
from django.forms.widgets import PasswordInput, TextInput
from .models import Product, Seller, UserProfile, Category
from django.db import transaction

class ProductForm(forms.ModelForm):
    categories = forms.ModelMultipleChoiceField(
        queryset=Category.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'main_image', 'image1', 'image2', 'image3', 'image4', 'image5', 'categories']

class SellerRegister(forms.ModelForm):
    class Meta:
        model = Seller
        fields = ['business_name', 'region', 'business_address', 'profile_photo', 'id_card']

class CustomRegisterForm(UserCreationForm):
    phone_number = forms.CharField(max_length=15, required=True)
    region = forms.CharField(widget=forms.Textarea, required=True)
    profile_picture = forms.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'region', 'password1', 'password2']

    @transaction.atomic
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data.get('email')
        if commit:
            user.save()
            UserProfile.objects.create(
                user=user,
                phone_number=self.cleaned_data.get('phone_number'),
                region=self.cleaned_data.get('region'),
            )
        return user

class Loginform(AuthenticationForm):
    username = forms.CharField(widget=TextInput())
    password = forms.CharField(widget=PasswordInput())