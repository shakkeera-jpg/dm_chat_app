from rest_framework.test import APITestCase

from .models import User


class AuthenticationTests(APITestCase):
    def test_register_login_and_reject_duplicates(self):
        payload = {'username': 'alice', 'email': 'alice@example.com', 'password': 'safe-password-123'}
        registered = self.client.post('/api/auth/register', payload, format='json')
        self.assertEqual(registered.status_code, 201)
        self.assertIn('access', registered.data)
        refreshed = self.client.post('/api/auth/refresh', {'refresh': registered.data['refresh']}, format='json')
        self.assertEqual(refreshed.status_code, 200)
        self.assertIn('access', refreshed.data)
        duplicate = self.client.post('/api/auth/register', payload, format='json')
        self.assertEqual(duplicate.status_code, 400)
        login = self.client.post('/api/auth/login', {'username': 'alice', 'password': payload['password']}, format='json')
        self.assertEqual(login.status_code, 200)

        user = User.objects.get(username='alice')
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotEqual(user.password, payload['password'])

    def test_login_rejects_invalid_credentials(self):
        User.objects.create_user('alice', 'alice@example.com', 'safe-password-123')
        response = self.client.post('/api/auth/login', {'username': 'alice', 'password': 'wrong-password'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid credentials.', str(response.data))
