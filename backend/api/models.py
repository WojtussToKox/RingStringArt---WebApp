import uuid

from django.db import models


class ActivationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True)
    batch_name = models.CharField(max_length=100)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.code} ({self.batch_name})"

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activation_code = models.OneToOneField(ActivationCode, on_delete=models.CASCADE)
    steps_data = models.JSONField() 
    current_step = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    generation_params = models.JSONField()

    def __str__(self):
        return f"Project for code: {self.activation_code.code}"