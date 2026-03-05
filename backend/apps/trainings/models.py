from django.db import models
import uuid

class SubscriptionPass(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    benefits = models.JSONField(default=list)

    def __str__(self):
        return self.name

class TrainingSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    instructor = models.CharField(max_length=100)
    date = models.DateTimeField()
    duration_minutes = models.IntegerField()
    capacity = models.IntegerField()

    def __str__(self):
        return self.title
