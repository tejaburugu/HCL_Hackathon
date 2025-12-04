from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, LogoutView, CurrentUserView,
    ProfileView, ChangePasswordView, ProviderPatientsView, ProviderPatientDetailView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Provider endpoints
    path('provider/patients/', ProviderPatientsView.as_view(), name='provider_patients'),
    path('provider/patients/<int:patient_id>/', ProviderPatientDetailView.as_view(), name='provider_patient_detail'),
]

