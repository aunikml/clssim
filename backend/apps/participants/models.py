from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class ParticipantProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='participant_profile'
    )
    display_name = models.CharField(max_length=120, blank=True)
    avatar_identifier = models.CharField(max_length=80, default='avatar_default')
    avatar_configuration = models.JSONField(default=dict, blank=True)
    organisation = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.display_name or self.user.username

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        ParticipantProfile.objects.create(
            user=instance,
            display_name=f"{instance.first_name} {instance.last_name}".strip() or instance.username
        )
    else:
        if hasattr(instance, 'participant_profile'):
            instance.participant_profile.save()
