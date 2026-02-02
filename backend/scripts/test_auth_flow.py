from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from api.views import me
from rest_framework.test import APIRequestFactory, force_authenticate

User = get_user_model()
user = User.objects.get(email='testtenant@example.com')
refresh = RefreshToken.for_user(user)
access = str(refresh.access_token)
print('access:', access)
print('refresh:', str(refresh))

factory = APIRequestFactory()
req = factory.get('/api/auth/me/')
force_authenticate(req, user=user)
resp = me(req)
print('me view:', resp.data)
