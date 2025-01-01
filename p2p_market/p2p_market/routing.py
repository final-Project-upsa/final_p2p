from django.urls import re_path
from p2p_site import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<chat_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi())
]