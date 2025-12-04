from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import PatientProfile, ProviderProfile

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    data_consent = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'role', 'phone', 'date_of_birth', 'data_consent'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        if not attrs.get('data_consent'):
            raise serializers.ValidationError({"data_consent": "You must consent to data usage to register."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['consent_date'] = timezone.now()
        user = User.objects.create_user(**validated_data)
        
        # Create profile based on role
        if user.role == 'patient':
            PatientProfile.objects.create(user=user)
        elif user.role == 'provider':
            ProviderProfile.objects.create(user=user)
        
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'phone',
            'date_of_birth', 'address', 'emergency_contact', 'emergency_phone',
            'profile_picture', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'created_at']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_provider_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'blood_type', 'height', 'weight', 'allergies',
            'current_medications', 'medical_conditions', 'assigned_provider',
            'assigned_provider_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'assigned_provider', 'created_at', 'updated_at']
    
    def get_assigned_provider_name(self, obj):
        if obj.assigned_provider:
            return f"Dr. {obj.assigned_provider.first_name} {obj.assigned_provider.last_name}"
        return None


class ProviderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    patient_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user', 'specialization', 'license_number',
            'hospital_affiliation', 'years_of_experience', 'patient_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_patient_count(self, obj):
        return PatientProfile.objects.filter(assigned_provider=obj.user).count()


class PatientListSerializer(serializers.ModelSerializer):
    """Serializer for providers to view their patients"""
    user = UserSerializer(read_only=True)
    compliance_status = serializers.SerializerMethodField()
    goals_met = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'compliance_status', 'goals_met']
    
    def get_compliance_status(self, obj):
        # This would be calculated based on goals and reminders
        from wellness.models import WellnessGoal
        today_goals = WellnessGoal.objects.filter(
            user=obj.user,
            date=timezone.now().date()
        )
        if not today_goals.exists():
            return 'No Goals Set'
        
        completed = today_goals.filter(is_completed=True).count()
        total = today_goals.count()
        
        if completed == total:
            return 'Goal Met'
        elif completed > 0:
            return 'In Progress'
        return 'Missed'
    
    def get_goals_met(self, obj):
        from wellness.models import WellnessGoal
        return WellnessGoal.objects.filter(user=obj.user, is_completed=True).count()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

