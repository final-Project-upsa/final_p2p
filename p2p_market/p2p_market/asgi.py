import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'p2p_market.settings')

import django
django.setup()

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            # Get token from query string
            query_string = scope['query_string'].decode()
            query_params = dict(qp.split('=') for qp in query_string.split('&') if qp)
            token = query_params.get('token')

            if token:
                # Use SimpleJWT's AccessToken to verify and decode
                token_obj = AccessToken(token)
                user = await self.get_user(token_obj['user_id'])
                scope['user'] = user
            else:
                scope['user'] = AnonymousUser()
        except (TokenError, KeyError):
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()

# Update your ASGI application
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from p2p_market.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        )
    ),
})