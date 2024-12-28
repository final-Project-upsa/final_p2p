from django.urls import path, include
from . import views
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse
from django.views.generic import TemplateView


urlpatterns = [
    #path('', views.homepage, name='homepage'),
    path('api/csrf/', ensure_csrf_cookie(lambda r: HttpResponse()), name='csrf'),
    path('add_product/', views.add_product, name='add_product'),
    path('product/<int:pk>/', views.product_detail, name='product_detail'),
    path('marketplace/', views.marketplacee, name='marketplace'),
    path('login', views.user_login, name='user_login'),
    path('register', views.register, name='register'),
    path('logout', views.custom_logout, name='custom_logout'),
    path('enroll_seller1', views.enroll_seller1, name='enroll_seller1'),
    # path('seller_dashboard/<int:pk>/', views.seller_dashboard, name='seller_dashboard'),
    path('seller_shop/<str:username>/', views.seller_shop, name='seller_shop'),
    path('create_chat/<int:seller_id>/<int:product_id>/', views.create_chat, name='create_chat'),
    path('inbox/', views.inbox, name='inbox'),
    path('chat_room/<int:chat_id>/', views.chat_room, name='chat_room'),
    path('get_new_messages/<int:chat_id>/', views.get_new_messages, name='get_new_messages'),
    path('api/save_favourite', views.save_favourite, name='save_favourite'),
    path('api/get_user_favourites', views.get_user_favourites, name='get_user_favourites'),
    path('api/get_product_details/<int:product_id>/', views.get_product_details, name='get_product_details'),
    path('api/search-suggestions/', views.search_suggestions, name='search_suggestions'),
    path('favorites/', views.all_favorites, name='all_favorites'),  
    path('api/marketplace/', views.marketplace, name='marketplace'),
    path('api/enroll_seller/', views.enroll_seller1, name='enroll_seller'),
    path('api/seller_dashboardd/<int:pk>/', views.seller_dashboardd, name='seller_dashboardd'),
    path('api/product/<int:pk>/', views.product_detaill, name='product_detaill'),
    path('api/product_handler/', views.product_handler, name='product_add'),
    path('api/product_handler/<int:pk>/', views.product_handler, name='product_delete'),
    path('api/update_product/<int:pk>/', views.update_product, name='update_producter'),
    path('api/register', views.register_api, name='register_api'),
    path('api/login_api', views.login_api, name='login_api'),
    path('api/userprofile/<int:pk>/', views.get_user, name='get_user'),
    path('api/favorites/', views.favorite_product, name='favourite_get'),  # GET request
    path('api/favorites/<int:pk>/', views.favorite_product, name='favourite_modify'),  # POST/DELETE requests
    
    
    
    # path('debug/users/', views.debug_user_create, name="debug_user_create"),
]
    