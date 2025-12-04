import { useState, useEffect } from 'react';
import { wellnessAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProgressBar from '../components/common/ProgressBar';
import ConfirmModal from '../components/common/ConfirmModal';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    goal_type: 'steps',
    title: '',
    target_value: '',
    unit: 'steps',
    date: new Date().toISOString().split('T')[0],
    is_recurring: true, // Default to recurring for daily goals
  });
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await wellnessAPI.getGoals();
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_type: 'steps',
      title: '',
      target_value: '',
      unit: 'steps',
      date: new Date().toISOString().split('T')[0],
      is_recurring: true,
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingGoal) {
      // Show confirmation modal for update
      setShowUpdateModal(true);
    } else {
      // Create new goal directly
      await createGoal();
    }
  };

  const createGoal = async () => {
    try {
      await wellnessAPI.createGoal(formData);
      await fetchGoals();
      resetForm();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const confirmUpdate = async () => {
    try {
      const updateData = {
        title: formData.title,
        target_value: formData.target_value,
        unit: formData.unit,
        is_recurring: formData.is_recurring,
      };
      console.log('Updating goal:', editingGoal.id, updateData);
      await wellnessAPI.updateGoal(editingGoal.id, updateData);
      await fetchGoals();
      resetForm();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goal_type: goal.goal_type,
      title: goal.title,
      target_value: goal.target_value,
      unit: goal.unit,
      date: goal.date,
      is_recurring: goal.is_recurring || false,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (goalToDelete) {
      try {
        await wellnessAPI.deleteGoal(goalToDelete.id);
        await fetchGoals();
        setGoalToDelete(null);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleLogProgress = async (goalId, value) => {
    try {
      await wellnessAPI.logProgress(goalId, { value: parseFloat(value) });
      await fetchGoals();
    } catch (error) {
      console.error('Error logging progress:', error);
    }
  };

  const getGoalIcon = (type) => {
    const icons = {
      steps: '👟',
      active_time: '⏱️',
      sleep: '🌙',
      water: '💧',
      calories: '🔥',
      custom: '🎯',
    };
    return icons[type] || '🎯';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="goals-page">
      <header className="goals-page__header">
        <div>
          <h1 className="goals-page__title">My Goals</h1>
          <p className="goals-page__subtitle">Track and manage your wellness goals</p>
        </div>
        <Button onClick={() => {
          if (showForm && editingGoal) {
            resetForm();
          } else {
            setShowForm(!showForm);
            setEditingGoal(null);
          }
        }}>
          {showForm ? 'Cancel' : '+ Add Goal'}
        </Button>
      </header>

      {showForm && (
        <Card className="goal-form-card">
          <h2 className="goal-form__title">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <form onSubmit={handleSubmit} className="goal-form">
            <div className="goal-form__row">
              <div className="input-group">
                <label className="input-label">Goal Type</label>
                <select
                  name="goal_type"
                  value={formData.goal_type}
                  onChange={handleChange}
                  className="input-field"
                  disabled={editingGoal !== null}
                >
                  <option value="steps">Steps</option>
                  <option value="active_time">Active Time</option>
                  <option value="sleep">Sleep</option>
                  <option value="water">Water Intake</option>
                  <option value="calories">Calories</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <Input
                label="Goal Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Daily Steps"
                required
              />
            </div>
            <div className="goal-form__row">
              <Input
                label="Target Value"
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleChange}
                required
              />
              <Input
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., steps, mins, glasses"
              />
              <Input
                label="Start Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={editingGoal !== null}
              />
            </div>
            
            {/* Recurring Goal Checkbox */}
            <div className="goal-form__row goal-form__row--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                />
                <span>🔄 Repeat daily</span>
              </label>
              <span className="checkbox-hint">
                {formData.is_recurring 
                  ? 'This goal will automatically repeat every day' 
                  : 'This is a one-time goal'
                }
              </span>
            </div>

            <div className="goal-form__actions">
              {editingGoal && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="goals-list">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} className="goal-item">
              <div className="goal-item__header">
                <span className="goal-item__icon">{getGoalIcon(goal.goal_type)}</span>
                <div className="goal-item__info">
                  <h3 className="goal-item__title">
                    {goal.title}
                    {goal.is_recurring && <span className="goal-item__recurring-badge">🔄</span>}
                  </h3>
                  <span className="goal-item__date">{goal.date}</span>
                </div>
                <div className="goal-item__header-actions">
                  {goal.is_completed && (
                    <span className="goal-item__badge">✓ Completed</span>
                  )}
                  <button 
                    className="goal-item__edit-btn"
                    onClick={() => handleEdit(goal)}
                    title="Edit goal"
                  >
                    ✏️
                  </button>
                  <button 
                    className="goal-item__delete-btn"
                    onClick={() => handleDeleteClick(goal)}
                    title="Delete goal"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="goal-item__progress">
                <div className="goal-item__values">
                  <span className="goal-item__current">{goal.current_value}</span>
                  <span className="goal-item__target">/ {goal.target_value} {goal.unit}</span>
                </div>
                <ProgressBar 
                  value={goal.current_value} 
                  max={goal.target_value}
                  color={goal.is_completed ? 'success' : 'primary'}
                />
              </div>
              
              {!goal.is_completed && (
                <div className="goal-item__actions">
                  <input
                    type="number"
                    placeholder="Add progress"
                    className="input-field goal-item__input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleLogProgress(goal.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      if (input.value) {
                        handleLogProgress(goal.id, input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Log
                  </Button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="no-goals">
            <p>No goals yet. Create your first wellness goal to get started!</p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setGoalToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={confirmUpdate}
        title="Update Goal"
        message={`Are you sure you want to update "${editingGoal?.title}" with the new values?`}
        confirmText="Update"
        cancelText="Cancel"
        variant="info"
      />
    </div>
  );
};

export default Goals;
