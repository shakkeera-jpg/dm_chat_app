from accounts.models import User
from rest_framework.test import APITestCase

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
