from .models import Category, UserProfile
from django.contrib.auth import get_user_model
from .models import Category, UserProfile

User = get_user_model()

def categories(request):
    return {'categories': Category.objects.all()}

def favorites(request):
    if request.user.is_authenticated:
        user_profile = UserProfile.objects.get(user=request.user)
        return {'favorites': user_profile.favourites.all()}
    return {'favorites': []}