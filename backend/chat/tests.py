import json

from asgiref.sync import async_to_sync
from accounts.models import User
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from config.asgi import application
from .models import Message


class MessagingApiTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user('alice', 'alice@example.com', 'safe-password-123')
        self.bob = User.objects.create_user('bob', 'bob@example.com', 'safe-password-123')
        Message.objects.create(sender=self.bob, recipient=self.alice, text_content='Hello Alice')
        self.client.force_authenticate(self.alice)

    def test_users_conversation_and_mark_read(self):
        users = self.client.get('/api/users')
        self.assertEqual(users.status_code, 200)
        self.assertEqual(users.data[0]['unread_count'], 1)
        messages = self.client.get(f'/api/messages/{self.bob.id}')
        self.assertEqual(messages.status_code, 200)
        self.assertEqual(len(messages.data), 1)
        marked = self.client.patch(f'/api/messages/{self.bob.id}/read')
        self.assertEqual(marked.data['marked_read'], 1)
        self.assertTrue(Message.objects.get().is_read)

    def test_users_exclude_current_user_and_conversation_is_chronological(self):
        Message.objects.create(sender=self.alice, recipient=self.bob, text_content='Reply')
        users = self.client.get('/api/users')
        self.assertEqual([user['id'] for user in users.data], [self.bob.id])
        self.assertFalse(users.data[0]['is_online'])

        messages = self.client.get(f'/api/messages/{self.bob.id}')
        self.assertEqual([message['text_content'] for message in messages.data], ['Hello Alice', 'Reply'])

    def test_messaging_endpoints_require_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 401)


class MessagingWebSocketTests(TransactionTestCase):
    """Exercise the real ASGI consumer, not only the REST views."""

    def setUp(self):
        self.alice = User.objects.create_user('alice', 'alice@example.com', 'safe-password-123')
        self.bob = User.objects.create_user('bob', 'bob@example.com', 'safe-password-123')

    def connect(self, user):
        token = str(AccessToken.for_user(user))
        communicator = WebsocketCommunicator(application, f'/ws/chat/?token={token}')
        connected, _ = async_to_sync(communicator.connect)()
        self.assertTrue(connected)
        return communicator

    def test_private_message_is_persisted_and_delivered(self):
        async def scenario():
            async def receive_event(communicator, event_type):
                for _ in range(5):
                    event = json.loads(await communicator.receive_from())
                    if event['type'] == event_type:
                        return event
                self.fail(f'Did not receive {event_type}.')

            sender = WebsocketCommunicator(application, f'/ws/chat/?token={AccessToken.for_user(self.alice)}')
            recipient = WebsocketCommunicator(application, f'/ws/chat/?token={AccessToken.for_user(self.bob)}')
            try:
                self.assertTrue((await sender.connect())[0])
                self.assertTrue((await recipient.connect())[0])
                await recipient.send_to(text_data=json.dumps({
                    'type': 'set_active_chat', 'other_user_id': self.alice.id,
                }))
                await sender.send_to(text_data=json.dumps({
                    'type': 'send_private_message',
                    'recipient_id': self.bob.id,
                    'text_content': 'Hello from Alice',
                }))
                return await receive_event(sender, 'message_sent'), await receive_event(recipient, 'private_message')
            finally:
                await sender.disconnect()
                await recipient.disconnect()

        sent, received = async_to_sync(scenario)()
        self.assertEqual(sent['type'], 'message_sent')
        self.assertEqual(received['type'], 'private_message')
        self.assertEqual(received['message']['text_content'], 'Hello from Alice')
        self.assertTrue(Message.objects.filter(sender=self.alice, recipient=self.bob).exists())

    def test_invalid_token_is_rejected(self):
        communicator = WebsocketCommunicator(application, '/ws/chat/?token=invalid')
        connected, close_code = async_to_sync(communicator.connect)()
        self.assertFalse(connected)
        self.assertEqual(close_code, 4401)
