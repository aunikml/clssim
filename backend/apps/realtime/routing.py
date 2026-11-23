from django.urls import re_path
from .consumers import ClassroomSessionConsumer

websocket_urlpatterns = [
    re_path(r'^ws/classrooms/sessions/(?P<session_id>[0-9a-f-]+)/$', ClassroomSessionConsumer.as_asgi()),
]
