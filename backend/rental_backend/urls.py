from django.contrib import admin
from django.urls import path, include
from accounts.views import EmailTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', EmailTokenObtainPairView.as_view()),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('api.urls')),
    path('api/ai/', include('ai_services.urls')),
]
