from django.urls import path
from .views import (
    WellnessGoalListCreateView, WellnessGoalDetailView, LogGoalProgressView,
    TodayGoalsView, WeeklyProgressView, PreventiveCareReminderListCreateView,
    PreventiveCareReminderDetailView, UpcomingRemindersView, HealthTipOfDayView,
    DashboardSummaryView
)

urlpatterns = [
    # Goals - specific paths MUST come before generic pk patterns
    path('goals/today/', TodayGoalsView.as_view(), name='today_goals'),
    path('goals/weekly/', WeeklyProgressView.as_view(), name='weekly_progress'),
    path('goals/', WellnessGoalListCreateView.as_view(), name='goals_list'),
    path('goals/<pk>/', WellnessGoalDetailView.as_view(), name='goal_detail'),
    path('goals/<goal_id>/log/', LogGoalProgressView.as_view(), name='log_goal_progress'),
    
    # Reminders - specific paths before generic patterns
    path('reminders/upcoming/', UpcomingRemindersView.as_view(), name='upcoming_reminders'),
    path('reminders/', PreventiveCareReminderListCreateView.as_view(), name='reminders_list'),
    path('reminders/<pk>/', PreventiveCareReminderDetailView.as_view(), name='reminder_detail'),
    
    # Health Tips
    path('health-tip/', HealthTipOfDayView.as_view(), name='health_tip'),
    
    # Dashboard
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard'),
]
