import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { wellnessAPI } from '../services/api';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import './Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [healthTip, setHealthTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [goalsRes, remindersRes, tipRes] = await Promise.all([
        wellnessAPI.getTodayGoals(),
        wellnessAPI.getUpcomingReminders(),
        wellnessAPI.getHealthTip(),
      ]);
      
      setGoals(goalsRes.data);
      setReminders(remindersRes.data);
      setHealthTip(tipRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load dashboard data. Please try again.');
      setGoals([]);
      setReminders([]);
      setHealthTip({
        title: 'Stay Hydrated',
        content: 'Aim to drink at least 8 glasses of water per day.',
        category: 'hydration'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getGoalIcon = (type) => {
    const icons = {
      steps: '👟',
      active_time: '⏱️',
      sleep: '🌙',
      water: '💧',
      calories: '🔥',
    };
    return icons[type] || '🎯';
  };

  const getProgressColor = (type) => {
    const colors = {
      steps: 'steps',
      active_time: 'active',
      sleep: 'sleep',
    };
    return colors[type] || 'primary';
  };

  const renderSleepIndicator = (goal) => {
    const sleepHours = Math.floor(goal.current_value || 0);
    const totalBlocks = 8;
    const filledBlocks = Math.min(sleepHours, totalBlocks);
    
    return (
      <div className="sleep-indicator">
        {[...Array(totalBlocks)].map((_, i) => (
          <div 
            key={i} 
            className={`sleep-block ${i < filledBlocks ? 'sleep-block--filled' : ''}`}
          />
        ))}
      </div>
    );
  };

  const handleLogProgress = async (goalId, inputElement) => {
    const value = inputElement.value;
    if (!value) return;
    
    try {
      await wellnessAPI.logProgress(goalId, { value: parseFloat(value) });
      inputElement.value = '';
      // Refresh goals after logging
      const goalsRes = await wellnessAPI.getTodayGoals();
      setGoals(goalsRes.data);
    } catch (err) {
      console.error('Error logging progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Welcome, {user?.first_name || 'User'}</h1>
      </header>

      {error && (
        <div className="dashboard__error">
          <p>{error}</p>
          <Button variant="secondary" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      )}

      <div className="dashboard__content">
        {/* Main Content */}
        <div className="dashboard__main">
          {/* Wellness Goals Section */}
          <section className="dashboard__section">
            <h2 className="section-title">Wellness Goals</h2>
            {goals.length > 0 ? (
              <div className="goals-grid">
                {goals.map((goal) => (
                  <Card key={goal.id} className="goal-card">
                    <div className="goal-card__header">
                      <span className="goal-card__icon">{getGoalIcon(goal.goal_type)}</span>
                      <span className="goal-card__title">{goal.title}</span>
                    </div>
                    
                    <div className="goal-card__stats">
                      <span className="goal-card__current">{goal.current_value || 0}</span>
                      <span className="goal-card__target">/{goal.target_value} {goal.unit}</span>
                    </div>
                    
                    {goal.goal_type === 'sleep' ? (
                      <>
                        {renderSleepIndicator(goal)}
                        <div className="goal-card__progress-text">
                          {goal.current_value || 0} of {goal.target_value} hours logged
                        </div>
                      </>
                    ) : (
                      <ProgressBar 
                        value={goal.current_value || 0} 
                        max={goal.target_value}
                        color={getProgressColor(goal.goal_type)}
                      />
                    )}
                    
                    {goal.goal_type === 'active_time' && (
                      <div className="goal-card__extra">
                        <span>{goal.extra_data?.calories || 0} Kcal</span>
                        <span>|</span>
                        <span>{goal.extra_data?.distance || 0}km</span>
                      </div>
                    )}

                    {/* Quick log input with button */}
                    <div className="goal-card__log">
                      <input
                        type="number"
                        placeholder={`Add ${goal.unit}`}
                        className="goal-card__input"
                        id={`log-input-${goal.id}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            handleLogProgress(goal.id, e.target);
                          }
                        }}
                      />
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => {
                          const input = document.getElementById(`log-input-${goal.id}`);
                          handleLogProgress(goal.id, input);
                        }}
                      >
                        Log
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="empty-state">
                <p>No goals set for today. Your goals will appear here once created.</p>
              </Card>
            )}
          </section>

          {/* Preventive Care Reminders */}
          <section className="dashboard__section">
            <h2 className="section-title">Preventive Care Reminders</h2>
            <Card className="reminders-card">
              {reminders.length > 0 ? (
                <ul className="reminders-list">
                  {reminders.map((reminder) => (
                    <li key={reminder.id} className="reminder-item">
                      <span className="reminder-item__icon">📅</span>
                      <span className="reminder-item__text">
                        <strong>Upcoming:</strong> {reminder.title} on {formatDate(reminder.scheduled_date)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-reminders">No upcoming reminders. Add reminders to stay on track with preventive care.</p>
              )}
            </Card>
          </section>

          {/* Health Tip of the Day */}
          <section className="dashboard__section">
            <h2 className="section-title">Health Tip of the Day</h2>
            <Card className="health-tip-card">
              {healthTip && (
                <>
                  <span className="health-tip-card__icon">💡</span>
                  <p className="health-tip-card__content">{healthTip.content}</p>
                </>
              )}
            </Card>
          </section>
        </div>

        {/* Sidebar Summary */}
        <aside className="dashboard__sidebar">
          <Card className="summary-card">
            <h3 className="summary-card__title">Today's Summary</h3>
            
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="summary-item">
                  <div className="summary-item__header">
                    <span className="summary-item__icon">{getGoalIcon(goal.goal_type)}</span>
                    <span className="summary-item__label">{goal.title}</span>
                  </div>
                  <div className="summary-item__value">
                    <strong>{goal.current_value || 0}</strong>
                    <span className="summary-item__target">/{goal.target_value} {goal.unit}</span>
                  </div>
                  <ProgressBar 
                    value={goal.current_value || 0} 
                    max={goal.target_value}
                    color={getProgressColor(goal.goal_type)}
                    size="small"
                  />
                  
                  {goal.goal_type === 'active_time' && goal.extra_data && (
                    <div className="summary-item__meta">
                      {goal.extra_data.calories || 0} Kcal | {goal.extra_data.distance || 0}km
                    </div>
                  )}
                  
                  {goal.goal_type === 'sleep' && (
                    <>
                      <div className="summary-item__meta">
                        {goal.current_value || 0} hours logged
                      </div>
                      {renderSleepIndicator(goal)}
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="no-data">No data yet</p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default PatientDashboard;
