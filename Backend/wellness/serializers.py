from rest_framework import serializers
from .models import WellnessGoal, DailyGoalLog, PreventiveCareReminder, HealthTip


class DailyGoalLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyGoalLog
        fields = ['id', 'value', 'notes', 'logged_at']
        read_only_fields = ['id', 'logged_at']


class WellnessGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = WellnessGoal
        fields = [
            'id', 'goal_type', 'title', 'target_value', 'current_value',
            'unit', 'date', 'is_completed', 'is_recurring', 'progress_percentage',
            'extra_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_completed', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Convert Decimal128 values to float for JSON serialization"""
        data = super().to_representation(instance)
        try:
            data['target_value'] = float(instance.target_value) if instance.target_value else 0
        except (TypeError, ValueError):
            data['target_value'] = 0
        try:
            data['current_value'] = float(instance.current_value) if instance.current_value else 0
        except (TypeError, ValueError):
            data['current_value'] = 0
        return data
    
    def get_progress_percentage(self, obj):
        try:
            target = float(obj.target_value) if obj.target_value else 0
            current = float(obj.current_value) if obj.current_value else 0
            if target == 0:
                return 0
            return min(100, int((current / target) * 100))
        except (TypeError, ValueError):
            return 0


class WellnessGoalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessGoal
        fields = ['goal_type', 'title', 'target_value', 'unit', 'date', 'is_recurring', 'extra_data']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WellnessGoalUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating wellness goals"""
    class Meta:
        model = WellnessGoal
        fields = ['title', 'target_value', 'unit', 'current_value', 'is_recurring']
        extra_kwargs = {
            'current_value': {'required': False},
            'is_recurring': {'required': False}
        }
    
    def to_representation(self, instance):
        """Use the read serializer for output"""
        return WellnessGoalSerializer(instance).data


class LogGoalProgressSerializer(serializers.Serializer):
    value = serializers.FloatField()
    notes = serializers.CharField(required=False, allow_blank=True)


class PreventiveCareReminderSerializer(serializers.ModelSerializer):
    scheduled_time = serializers.TimeField(required=False, allow_null=True)
    recurrence_interval = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = PreventiveCareReminder
        fields = [
            'id', 'reminder_type', 'title', 'description', 'scheduled_date',
            'scheduled_time', 'status', 'location', 'notes', 'is_recurring',
            'recurrence_interval', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'notes': {'required': False, 'allow_blank': True},
        }
    
    def to_internal_value(self, data):
        # Convert empty strings to None for optional fields
        # Make a mutable copy of the data
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        if mutable_data.get('scheduled_time') == '':
            mutable_data['scheduled_time'] = None
        if mutable_data.get('recurrence_interval') == '':
            mutable_data['recurrence_interval'] = None
        if mutable_data.get('description') == '':
            mutable_data['description'] = None
        if mutable_data.get('location') == '':
            mutable_data['location'] = None
        if mutable_data.get('notes') == '':
            mutable_data['notes'] = None
        return super().to_internal_value(mutable_data)
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class HealthTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthTip
        fields = ['id', 'title', 'content', 'category', 'display_date', 'created_at']
        read_only_fields = ['id', 'created_at']
