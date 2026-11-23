from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.me_url = '/api/v1/auth/me/'

    def test_user_registration_and_login(self):
        reg_payload = {
            'username': 'newteacher',
            'email': 'newteacher@classsim.local',
            'password': 'securepassword123',
            'first_name': 'Robert',
            'last_name': 'Brown',
            'display_name': 'Robert Brown, M.Ed.',
            'organisation': 'Springfield Academy'
        }
        res = self.client.post(self.register_url, reg_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        access_token = res.data['tokens']['access']

        # Access /me
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_res = self.client.get(self.me_url)
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['username'], 'newteacher')
        self.assertEqual(me_res.data['profile']['display_name'], 'Robert Brown, M.Ed.')
        self.assertEqual(me_res.data['profile']['organisation'], 'Springfield Academy')
