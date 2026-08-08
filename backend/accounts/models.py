from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Application user. Django securely hashes passwords by default."""

    email = models.EmailField('email address', unique=True)
    is_online = models.BooleanField(default=False)
