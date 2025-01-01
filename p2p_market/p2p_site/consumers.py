# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Chat, Message, ChatNotification

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connection attempt...")  # Debug log
        
        self.user = self.scope["user"]
        print(f"User authenticated: {self.user.is_authenticated}")  # Debug log
        
        if not self.user.is_authenticated:
            print("Authentication failed")  # Debug log
            await self.close()
            return

        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f"chat_{self.chat_id}"
        self.user_group_name = f"user_{self.user.id}"

        # Verify user is participant in chat
        if not await self.is_chat_participant():
            print(f"User {self.user.id} is not a participant in chat {self.chat_id}")  # Debug log
            await self.close()
            return

        # Join chat group
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )

        # Join user's personal notification group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"Connection accepted for user {self.user.id} in chat {self.chat_id}")  # Debug log

        # Mark previous messages as read
        await self.mark_messages_read()
        
        # Send chat history
        await self.send_chat_history()

    
    async def disconnect(self, close_code):
        # Check if chat_group_name exists before trying to use it
        if hasattr(self, 'chat_group_name'):
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )
        
        # Check if user_group_name exists before trying to use it
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        content = data.get('content')
        metadata = data.get('metadata', {})

        if message_type == 'chat_message':
            # Save message to database
            message = await self.save_message(content, 'text', metadata)
            
            # Update chat's last_message_at
            await self.update_chat_timestamp()

            # Create notifications for other participants
            await self.create_notifications(message)

            # Prepare message data
            message_data = {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'sender_id': self.user.id,
                    'sender_name': self.user.full_name or self.user.username,
                    'content': content,
                    'timestamp': message.timestamp.isoformat(),
                    'message_type': 'text',
                    'metadata': metadata,
                    'is_read': False
                }
            }

            # Send message to chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                message_data
            )

            # Send notifications to other participants' notification groups
            other_participants = await self.get_other_participants()
            
            notification_data = {
                'type': 'new_message_notification',
                'notification': {
                    'id': f"chat-{self.chat_id}-{message.id}",
                    'type': 'chat',
                    'title': f"New message from {self.user.full_name or self.user.username}",
                    'message': content,
                    'reference_id': self.chat_id,
                    'created_at': message.timestamp.isoformat(),
                    'read': False,
                    'data': {
                        'chat_id': self.chat_id,
                        'message_id': message.id,
                        'sender_id': self.user.id,
                        'sender_name': self.user.full_name or self.user.username
                    }
                }
            }

            for participant in other_participants:
                await self.channel_layer.group_send(
                    f"user_notifications_{participant.id}",
                    notification_data
                )

    @database_sync_to_async
    def get_other_participants(self):
        """Get all participants in the chat except the current user"""
        chat = Chat.objects.get(id=self.chat_id)
        return list(chat.participants.exclude(id=self.user.id))
    
    
    

    async def chat_message(self, event):
        """
        Handler for chat_message type events.
        """
        # print("Handling chat_message event:", event)  # Debug log
        # Only send once
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    @database_sync_to_async
    def is_chat_participant(self):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            return chat.participants.filter(id=self.user.id).exists()
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, message_type='text', metadata=None):
        chat = Chat.objects.get(id=self.chat_id)
        return Message.objects.create(
            chat=chat,
            sender=self.user,
            content=content,
            message_type=message_type,
            metadata=metadata
        )

    @database_sync_to_async
    def update_chat_timestamp(self):
        Chat.objects.filter(id=self.chat_id).update(
            last_message_at=timezone.now()
        )

    @database_sync_to_async
    def create_notifications(self, message):
        chat = Chat.objects.get(id=self.chat_id)
        other_participants = chat.participants.exclude(id=self.user.id)
        
        notifications = [
            ChatNotification(
                recipient=participant,
                chat=chat,
                message=message
            )
            for participant in other_participants
        ]
        ChatNotification.objects.bulk_create(notifications)

    @database_sync_to_async
    def mark_messages_read(self):
        chat = Chat.objects.get(id=self.chat_id)
        Message.objects.filter(
            chat=chat
        ).exclude(
            sender=self.user
        ).update(is_read=True)
        
        ChatNotification.objects.filter(
            recipient=self.user,
            chat_id=self.chat_id,
            is_read=False
        ).update(is_read=True)

    @database_sync_to_async
    def get_chat_history(self):
        chat = Chat.objects.get(id=self.chat_id)
        messages = Message.objects.filter(chat=chat).select_related('sender')
        return [
            {
                'id': msg.id,
                'sender_id': msg.sender.id if msg.sender else None,
                'sender_name': (msg.sender.full_name if hasattr(msg.sender, 'full_name') else msg.sender.username) if msg.sender else 'System',
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'message_type': msg.message_type,
                'metadata': msg.metadata if hasattr(msg, 'metadata') else {},
                'is_read': msg.is_read
            }
            for msg in messages
        ]

    async def send_chat_history(self):
        history = await self.get_chat_history()
        await self.send(text_data=json.dumps({
            'type': 'chat_history',
            'messages': history
        }))
        
        

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.notification_group_name = f"user_notifications_{self.user.id}"
        
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )

    async def new_message_notification(self, event):
        """Handle new message notifications"""
        await self.send(text_data=json.dumps(event))