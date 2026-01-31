from django.db import models

class Property(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bedrooms = models.IntegerField(default=0)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Tenant(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='tenants')
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Payment(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')

    def __str__(self):
        return f"Payment {self.id} - {self.amount}"

class MaintenanceRequest(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_requests')
    property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_requests')
    issue_description = models.TextField()
    status = models.CharField(max_length=50, default='submitted')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Maintenance {self.id} - {self.status}"
