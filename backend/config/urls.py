from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import HealthCheckView
from apps.classrooms.tts_views import GoogleTTSSynthesizeView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/health/', HealthCheckView.as_view(), name='health_check'),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/classrooms/', include('apps.classrooms.urls')),
    path('api/v1/sessions/', include('apps.sessions.urls')),
    path('api/v1/tts/synthesize/', GoogleTTSSynthesizeView.as_view(), name='google_tts_synthesize'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
