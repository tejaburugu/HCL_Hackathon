from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta
import random
import traceback

from .models import WellnessGoal, DailyGoalLog, PreventiveCareReminder, HealthTip
from .serializers import (
    WellnessGoalSerializer, WellnessGoalCreateSerializer, WellnessGoalUpdateSerializer,
    LogGoalProgressSerializer, PreventiveCareReminderSerializer, HealthTipSerializer
)


class WellnessGoalListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WellnessGoalCreateSerializer
        return WellnessGoalSerializer
    
    def get_queryset(self):
        queryset = WellnessGoal.objects.filter(user=self.request.user)
        
        # Filter by date
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)
        
        # Filter by goal type
        goal_type = self.request.query_params.get('type')
        if goal_type:
            queryset = queryset.filter(goal_type=goal_type)
        
        return queryset


class WellnessGoalDetailView(APIView):
    """Retrieve, update or delete a wellness goal"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            return WellnessGoal.objects.get(pk=pk, user=user)
        except WellnessGoal.DoesNotExist:
            return None
    
    def get(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = WellnessGoalSerializer(goal)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        try:
            goal = self.get_object(pk, request.user)
            if not goal:
                return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Update fields manually to avoid serializer issues with Decimal128
            data = request.data
            print(f"Updating goal {pk} with data: {data}")
            
            # IMPORTANT: Convert ALL numeric fields to float before saving
            # This fixes MongoDB Decimal128 incompatibility
            goal.target_value = float(goal.target_value) if goal.target_value else 0
            goal.current_value = float(goal.current_value) if goal.current_value else 0
            
            if 'title' in data:
                goal.title = data['title']
            if 'target_value' in data:
                goal.target_value = float(data['target_value'])
            if 'unit' in data:
                goal.unit = data['unit']
            if 'current_value' in data:
                goal.current_value = float(data['current_value'])
            
            goal.save()
            
            serializer = WellnessGoalSerializer(goal)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error updating goal: {e}")
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, pk):
        return self.patch(request, pk)
    
    def delete(self, request, pk):
        try:
            goal = self.get_object(pk, request.user)
            if not goal:
                return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
            goal.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error deleting goal: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogGoalProgressView(APIView):
    """Log progress for a specific goal"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, goal_id):
        try:
            goal = WellnessGoal.objects.get(id=goal_id, user=request.user)
        except WellnessGoal.DoesNotExist:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = LogGoalProgressSerializer(data=request.data)
        if serializer.is_valid():
            value = serializer.validated_data['value']
            notes = serializer.validated_data.get('notes', '')
            
            # Create log entry
            DailyGoalLog.objects.create(goal=goal, value=value, notes=notes)
            
            # Update goal current value - convert to float for MongoDB Decimal128 compatibility
            current = float(goal.current_value) if goal.current_value else 0
            goal.current_value = current + float(value)
            goal.save()
            
            return Response(WellnessGoalSerializer(goal).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TodayGoalsView(APIView):
    """Get today's wellness goals summary for dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            today = timezone.now().date()
            goals = WellnessGoal.objects.filter(user=request.user, date=today)
            
            # If no goals for today, check for recurring goals and create them
            if not goals.exists():
                # First, check for recurring goals from previous days
                recurring_goals = WellnessGoal.objects.filter(
                    user=request.user,
                    is_recurring=True
                ).exclude(date=today).order_by('-date')
                
                # Get unique goal types from recurring goals (most recent for each type)
                seen_types = set()
                for goal in recurring_goals:
                    if goal.goal_type not in seen_types:
                        seen_types.add(goal.goal_type)
                        try:
                            WellnessGoal.objects.get_or_create(
                                user=request.user,
                                goal_type=goal.goal_type,
                                date=today,
                                defaults={
                                    'title': goal.title,
                                    'target_value': float(goal.target_value),
                                    'current_value': 0.0,
                                    'unit': goal.unit,
                                    'is_recurring': True,
                                }
                            )
                        except Exception as e:
                            print(f"Error creating recurring goal: {e}")
                            continue
                
                # If still no goals, create default goals
                goals = WellnessGoal.objects.filter(user=request.user, date=today)
                if not goals.exists():
                    default_goal_types = ['steps', 'active_time', 'sleep']
                    for goal_type in default_goal_types:
                        try:
                            defaults = WellnessGoal.DEFAULT_GOALS.get(goal_type, {})
                            WellnessGoal.objects.get_or_create(
                                user=request.user,
                                goal_type=goal_type,
                                date=today,
                                defaults={
                                    'title': defaults.get('title', goal_type.replace('_', ' ').title()),
                                    'target_value': float(defaults.get('target_value', 0)),
                                    'current_value': 0.0,
                                    'unit': defaults.get('unit', ''),
                                    'is_recurring': True,  # Default goals are recurring
                                }
                            )
                        except Exception as e:
                            print(f"Error creating default goal: {e}")
                            continue
                    goals = WellnessGoal.objects.filter(user=request.user, date=today)
            
            serializer = WellnessGoalSerializer(goals, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"TodayGoalsView error: {e}")
            traceback.print_exc()
            # Return empty goals instead of error to allow dashboard to load
            return Response([])


class WeeklyProgressView(APIView):
    """Get weekly progress summary"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            
            goals = WellnessGoal.objects.filter(
                user=request.user,
                date__gte=week_ago,
                date__lte=today
            )
            
            # Calculate weekly stats
            total_goals = goals.count()
            completed_goals = goals.filter(is_completed=True).count()
            
            # Steps summary
            steps_data = goals.filter(goal_type='steps').aggregate(
                total=Sum('current_value'),
                target=Sum('target_value')
            )
            
            return Response({
                'total_goals': total_goals,
                'completed_goals': completed_goals,
                'completion_rate': round((completed_goals / total_goals * 100) if total_goals > 0 else 0, 1),
                'steps_summary': steps_data,
                'goals': WellnessGoalSerializer(goals, many=True).data
            })
        except Exception as e:
            print(f"WeeklyProgressView error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PreventiveCareReminderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PreventiveCareReminderSerializer
    
    def get_queryset(self):
        queryset = PreventiveCareReminder.objects.filter(user=self.request.user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class PreventiveCareReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PreventiveCareReminderSerializer
    
    def get_queryset(self):
        return PreventiveCareReminder.objects.filter(user=self.request.user)


class UpcomingRemindersView(APIView):
    """Get upcoming preventive care reminders for dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            today = timezone.now().date()
            reminders = PreventiveCareReminder.objects.filter(
                user=request.user,
                status='upcoming',
                scheduled_date__gte=today
            ).order_by('scheduled_date')[:5]
            
            serializer = PreventiveCareReminderSerializer(reminders, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"UpcomingRemindersView error: {e}")
            return Response([], status=status.HTTP_200_OK)


class HealthTipOfDayView(APIView):
    """Get health tip of the day"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            today = timezone.now().date()
            
            # Try to get tip for today
            tip = HealthTip.objects.filter(display_date=today, is_active=True).first()
            
            # If no specific tip for today, get a random active tip
            if not tip:
                tips = list(HealthTip.objects.filter(is_active=True))
                if tips:
                    tip = random.choice(tips)
            
            if tip:
                serializer = HealthTipSerializer(tip)
                return Response(serializer.data)
            
            # Return a default tip if none exist in database
            return Response({
                'id': 0,
                'title': 'Stay Hydrated',
                'content': 'Aim to drink at least 8 glasses of water per day to keep your body hydrated and functioning optimally.',
                'category': 'hydration'
            })
        except Exception as e:
            print(f"HealthTipOfDayView error: {e}")
            # Return default tip on error
            return Response({
                'id': 0,
                'title': 'Stay Hydrated',
                'content': 'Aim to drink at least 8 glasses of water per day to keep your body hydrated and functioning optimally.',
                'category': 'hydration'
            })


class DashboardSummaryView(APIView):
    """Get complete dashboard summary for patients"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            if request.user.role != 'patient':
                return Response(
                    {'error': 'This endpoint is only for patients'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            today = timezone.now().date()
            
            # Get today's goals
            goals = WellnessGoal.objects.filter(user=request.user, date=today)
            
            # Get upcoming reminders
            reminders = PreventiveCareReminder.objects.filter(
                user=request.user,
                status='upcoming',
                scheduled_date__gte=today
            ).order_by('scheduled_date')[:3]
            
            # Get health tip
            tip = HealthTip.objects.filter(is_active=True).first()
            tip_data = HealthTipSerializer(tip).data if tip else {
                'title': 'Stay Hydrated',
                'content': 'Aim to drink at least 8 glasses of water per day.',
                'category': 'hydration'
            }
            
            return Response({
                'user': {
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                },
                'goals': WellnessGoalSerializer(goals, many=True).data,
                'reminders': PreventiveCareReminderSerializer(reminders, many=True).data,
                'health_tip': tip_data
            })
        except Exception as e:
            print(f"DashboardSummaryView error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
