import logging
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import PatientProfile, ProviderProfile, AuditLog
from .serializers import (
    UserRegistrationSerializer, UserSerializer, PatientProfileSerializer,
    ProviderProfileSerializer, PatientListSerializer, ChangePasswordSerializer
)

User = get_user_model()
security_logger = logging.getLogger('security')


def log_action(user, action, resource=None, resource_id=None, request=None, details=None):
    """Helper function to log user actions for HIPAA compliance"""
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        user_agent = request.META.get('HTTP_USER_AGENT')
    
    AuditLog.objects.create(
        user=user,
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else None,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details
    )
    security_logger.info(f"User {user.email} performed {action} on {resource}:{resource_id}")


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Log successful login
            email = request.data.get('email')
            try:
                user = User.objects.get(email=email)
                log_action(user, 'login', request=request)
                
                # Add user data to response
                response.data['user'] = UserSerializer(user).data
            except User.DoesNotExist:
                pass
        
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            log_action(request.user, 'logout', request=request)
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        log_action(user, 'view_profile', 'User', user.id, request)
        
        data = {'user': UserSerializer(user).data}
        
        if user.role == 'patient':
            try:
                profile = user.patient_profile
                data['profile'] = PatientProfileSerializer(profile).data
            except PatientProfile.DoesNotExist:
                profile = PatientProfile.objects.create(user=user)
                data['profile'] = PatientProfileSerializer(profile).data
        elif user.role == 'provider':
            try:
                profile = user.provider_profile
                data['profile'] = ProviderProfileSerializer(profile).data
            except ProviderProfile.DoesNotExist:
                profile = ProviderProfile.objects.create(user=user)
                data['profile'] = ProviderProfileSerializer(profile).data
        
        return Response(data)
    
    def patch(self, request):
        user = request.user
        
        # Update user fields
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        
        # Update profile fields
        profile_data = request.data.get('profile', {})
        if user.role == 'patient' and profile_data:
            try:
                profile = user.patient_profile
            except PatientProfile.DoesNotExist:
                profile = PatientProfile.objects.create(user=user)
            
            profile_serializer = PatientProfileSerializer(profile, data=profile_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()
        
        log_action(user, 'update_profile', 'User', user.id, request)
        return Response({'message': 'Profile updated successfully'})


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            log_action(request.user, 'update_profile', 'Password', request.user.id, request)
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProviderPatientsView(APIView):
    """View for providers to see their assigned patients"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'provider':
            return Response(
                {'error': 'Only healthcare providers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        patients = PatientProfile.objects.filter(assigned_provider=request.user)
        serializer = PatientListSerializer(patients, many=True)
        
        log_action(request.user, 'view_patient', 'PatientList', None, request)
        return Response(serializer.data)


class ProviderPatientDetailView(APIView):
    """View for providers to see detailed patient information"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, patient_id):
        if request.user.role != 'provider':
            return Response(
                {'error': 'Only healthcare providers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient_profile = PatientProfile.objects.get(
                id=patient_id,
                assigned_provider=request.user
            )
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient not found or not assigned to you'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        log_action(request.user, 'view_patient', 'PatientProfile', patient_id, request)
        
        # Get patient's wellness data
        from wellness.models import WellnessGoal, PreventiveCareReminder
        from wellness.serializers import WellnessGoalSerializer, PreventiveCareReminderSerializer
        
        goals = WellnessGoal.objects.filter(user=patient_profile.user).order_by('-date')[:10]
        reminders = PreventiveCareReminder.objects.filter(user=patient_profile.user)
        
        return Response({
            'profile': PatientProfileSerializer(patient_profile).data,
            'goals': WellnessGoalSerializer(goals, many=True).data,
            'reminders': PreventiveCareReminderSerializer(reminders, many=True).data,
        })
