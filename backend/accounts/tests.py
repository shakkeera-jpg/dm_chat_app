from rest_framework.test import APITestCase


class AuthenticationTests(APITestCase):
    def test_register_login_and_reject_duplicates(self):
        payload = {'username': 'alice', 'email': 'alice@example.com', 'password': 'safe-password-123'}
        registered = self.client.post('/api/auth/register', payload, format='json')
        self.assertEqual(registered.status_code, 201)
        self.assertIn('access', registered.data)
        duplicate = self.client.post('/api/auth/register', payload, format='json')
        self.assertEqual(duplicate.status_code, 400)
        login = self.client.post('/api/auth/login', {'username': 'alice', 'password': payload['password']}, format='json')
        self.assertEqual(login.status_code, 200)
