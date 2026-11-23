from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.participants.models import ParticipantProfile

User = get_user_model()

class ParticipantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParticipantProfile
        fields = ('id', 'display_name', 'avatar_identifier', 'avatar_configuration', 'organisation', 'created_at', 'updated_at')

class UserSerializer(serializers.ModelSerializer):
    profile = ParticipantProfileSerializer(source='participant_profile', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile', 'date_joined', 'updated_at')
        read_only_fields = ('id', 'date_joined', 'updated_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    display_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    organisation = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'display_name', 'organisation')

    def create(self, validated_data):
        display_name = validated_data.pop('display_name', None)
        organisation = validated_data.pop('organisation', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)
        profile = user.participant_profile
        if display_name:
            profile.display_name = display_name
        if organisation:
            profile.organisation = organisation
        profile.save()
        return user
