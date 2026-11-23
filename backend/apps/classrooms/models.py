import uuid
from django.db import models

class Classroom(models.Model):
    ENVIRONMENT_CHOICES = (
        ('traditional', 'Traditional Classroom'),
        ('smart', 'Smart Classroom'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    environment_type = models.CharField(max_length=40, choices=ENVIRONMENT_CHOICES, default='traditional')
    width = models.FloatField(default=20.0)
    length = models.FloatField(default=16.0)
    wall_height = models.FloatField(default=5.0)
    configuration = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.environment_type})"

    @classmethod
    def get_default_configuration(cls, width=20.0, length=16.0, height=5.0):
        return {
            "dimensions": {
                "width": width,
                "length": length,
                "height": height
            },
            "environment": "traditional",
            "seating": {
                "rows": 4,
                "columns": 5,
                "spacing_x": 2.4,
                "spacing_z": 2.2,
                "start_x": -4.8,
                "start_z": 3.5
            },
            "teaching_area": {
                "blackboard": {
                    "width": 7.0,
                    "height": 2.4,
                    "position": [0, 2.2, -7.8]
                },
                "teacher_desk": {
                    "position": [-3.5, 0, -4.8],
                    "rotation": [0, 0.2, 0]
                },
                "teacher_avatar": {
                    "position": [0, 0, -4.5],
                    "rotation": [0, 0, 0]
                }
            },
            "architecture": {
                "door": {
                    "wall": "back_or_side",
                    "position": [9.8, 0, 4.5]
                },
                "windows": {
                    "wall": "left",
                    "count": 4,
                    "height": 2.2,
                    "width": 2.0
                },
                "decorations": {
                    "clock": [0, 4.2, -7.8],
                    "noticeboard": [6.0, 2.5, -7.8],
                    "bookshelf": [-9.2, 0, 0]
                }
            },
            "camera": {
                "default_position": [0, 9, 14],
                "target": [0, 1.5, 0],
                "fov": 50,
                "min_distance": 4,
                "max_distance": 25,
                "max_polar_angle": 1.52
            }
        }

    def save(self, *args, **kwargs):
        if not self.configuration:
            self.configuration = self.get_default_configuration(self.width, self.length, self.wall_height)
        super().save(*args, **kwargs)
