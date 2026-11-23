from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import connection
from channels.layers import get_channel_layer
import logging

logger = logging.getLogger(__name__)

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        health_status = {
            'status': 'healthy',
            'version': '1.0.0',
            'components': {}
        }
        all_ok = True

        # Database health check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
            health_status['components']['database'] = {
                'status': 'ok' if row and row[0] == 1 else 'error',
                'engine': connection.settings_dict['ENGINE'].split('.')[-1]
            }
        except Exception as e:
            all_ok = False
            health_status['components']['database'] = {
                'status': 'error',
                'error': str(e)
            }

        # Channels / Redis health check
        try:
            channel_layer = get_channel_layer()
            health_status['components']['channel_layer'] = {
                'status': 'ok' if channel_layer is not None else 'warning',
                'type': channel_layer.__class__.__name__ if channel_layer else 'none'
            }
        except Exception as e:
            health_status['components']['channel_layer'] = {
                'status': 'error',
                'error': str(e)
            }

        status_code = status.HTTP_200_OK if all_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        if not all_ok:
            health_status['status'] = 'degraded'

        return Response(health_status, status=status_code)
