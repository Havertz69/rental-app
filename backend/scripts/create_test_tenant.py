from django.contrib.auth import get_user_model
from api.models import Tenant

User = get_user_model()
email = 'testtenant@example.com'
password = 'TestPass123'

if not User.objects.filter(email=email).exists():
    user = User.objects.create_user(username=email, email=email, password=password)
else:
    user = User.objects.get(email=email)

tenant, created = Tenant.objects.get_or_create(email=email, defaults={'first_name':'Test','last_name':'Tenant','phone':'555-0001','active':True})
tenant.user = user
tenant.save()
print('tenant', tenant.id, 'user', user.id, 'created=', created)
