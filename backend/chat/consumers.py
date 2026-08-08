import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):
    """Authenticated WebSocket for private messages, notifications and typing."""

    async def connect(self):
        token = self._query_value('token')
        try:
            payload = AccessToken(token)
            self.user = await sync_to_async(User.objects.get)(id=payload['user_id'])
        except (TokenError, User.DoesNotExist, KeyError, TypeError):
            await self.close(code=4401)
            return

        self.active_chat_id = None
        self.group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add('online_users', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await self.channel_layer.group_discard('online_users', self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return await self._error('Invalid JSON payload.')

        event_type = data.get('type')
        if event_type == 'set_active_chat':
            self.active_chat_id = data.get('other_user_id')
            return
        if event_type == 'typing_status':
            await self._typing(data)
            return
        if event_type == 'send_private_message':
            await self._send_message(data)
            return
        await self._error('Unsupported event type.')

    async def _send_message(self, data):
        recipient_id = data.get('recipient_id')
        text_content = str(data.get('text_content', '')).strip()
        if not recipient_id or not text_content or len(text_content) > 2000:
            return await self._error('A recipient and a message up to 2000 characters are required.')
        try:
            message = await self._create_message(recipient_id, text_content)
        except User.DoesNotExist:
            return await self._error('Recipient not found.')
        payload = await self._message_payload(message)
        await self.send(text_data=json.dumps({'type': 'message_sent', 'message': payload}))
        await self.channel_layer.group_send(f'user_{recipient_id}', {'type': 'deliver_message', 'message': payload})

    async def _typing(self, data):
        recipient_id = data.get('recipient_id')
        if not recipient_id or not await self._user_exists(recipient_id):
            return
        await self.channel_layer.group_send(f'user_{recipient_id}', {
            'type': 'deliver_typing', 'sender_id': self.user.id, 'is_typing': bool(data.get('is_typing')),
        })

    async def deliver_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({'type': 'private_message', 'message': message}))
        if self.active_chat_id != message['sender_id']:
            await self.send(text_data=json.dumps({'type': 'new_message_notification', 'message': message}))

    async def deliver_typing(self, event):
        if self.active_chat_id == event['sender_id']:
            await self.send(text_data=json.dumps({
                'type': 'typing_status',
                'sender_id': event['sender_id'],
                'is_typing': event['is_typing'],
            }))

    async def user_registered(self, event):
        await self.send(text_data=json.dumps({'type': 'user_registered', 'user': event['user']}))

    async def _error(self, detail):
        await self.send(text_data=json.dumps({'type': 'error', 'detail': detail}))

    def _query_value(self, name):
        from urllib.parse import parse_qs
        values = parse_qs(self.scope['query_string'].decode()).get(name, [])
        return values[0] if values else None

    @sync_to_async
    def _create_message(self, recipient_id, text_content):
        recipient = User.objects.get(id=recipient_id)
        return Message.objects.create(sender=self.user, recipient=recipient, text_content=text_content)

    @sync_to_async
    def _user_exists(self, user_id):
        return User.objects.filter(id=user_id).exists()

    @sync_to_async
    def _message_payload(self, message):
        return {'id': message.id, 'sender_id': message.sender_id, 'recipient_id': message.recipient_id, 'text_content': message.text_content, 'is_read': message.is_read, 'created_at': message.created_at.isoformat()}
