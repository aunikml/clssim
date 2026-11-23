from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomSessionViewSet
from apps.seating.views import SessionSeatListView, SessionSeatReserveView, SessionSeatReleaseView

router = DefaultRouter()
router.register(r'', ClassroomSessionViewSet, basename='session')

urlpatterns = [
    # Seating routes nested under sessions
    path('<uuid:session_id>/seats/', SessionSeatListView.as_view(), name='session_seats_list'),
    path('<uuid:session_id>/seats/reserve/', SessionSeatReserveView.as_view(), name='session_seats_reserve'),
    path('<uuid:session_id>/seats/release/', SessionSeatReleaseView.as_view(), name='session_seats_release'),

    # ViewSet routes
    path('', include(router.urls)),
]
