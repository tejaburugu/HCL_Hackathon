from django.contrib import admin
from .models import WellnessGoal, DailyGoalLog, PreventiveCareReminder, HealthTip


@admin.register(WellnessGoal)
class WellnessGoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'goal_type', 'title', 'current_value', 'target_value', 'date', 'is_completed']
    list_filter = ['goal_type', 'is_completed', 'date']
    search_fields = ['user__email', 'title']
    date_hierarchy = 'date'


@admin.register(DailyGoalLog)
class DailyGoalLogAdmin(admin.ModelAdmin):
    list_display = ['goal', 'value', 'logged_at']
    list_filter = ['logged_at']


@admin.register(PreventiveCareReminder)
class PreventiveCareReminderAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'reminder_type', 'scheduled_date', 'status']
    list_filter = ['reminder_type', 'status', 'scheduled_date']
    search_fields = ['user__email', 'title']
    date_hierarchy = 'scheduled_date'


@admin.register(HealthTip)
class HealthTipAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_active', 'display_date']
    list_filter = ['category', 'is_active']
    search_fields = ['title', 'content']
