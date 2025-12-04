import { useState, useEffect } from 'react';
import { wellnessAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ConfirmModal from '../components/common/ConfirmModal';
import './Reminders.css';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    reminder_type: 'checkup',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    location: '',
    notes: '',
    is_recurring: false,
    recurrence_interval: '',
  });
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await wellnessAPI.getReminders();
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reminder_type: 'checkup',
      title: '',
      description: '',
      scheduled_date: '',
      scheduled_time: '',
      location: '',
      notes: '',
      is_recurring: false,
      recurrence_interval: '',
    });
    setEditingReminder(null);
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
    
    if (editingReminder) {
      setShowUpdateModal(true);
    } else {
      await createReminder();
    }
  };

  // Clean form data - convert empty strings to null for optional fields
  const cleanFormData = (data) => {
    const cleaned = { ...data };
    // Convert empty strings to null for optional fields
    if (cleaned.scheduled_time === '') cleaned.scheduled_time = null;
    if (cleaned.description === '') cleaned.description = null;
    if (cleaned.location === '') cleaned.location = null;
    if (cleaned.notes === '') cleaned.notes = null;
    if (cleaned.recurrence_interval === '') cleaned.recurrence_interval = null;
    // Convert recurrence_interval to number if it exists
    if (cleaned.recurrence_interval) {
      cleaned.recurrence_interval = parseInt(cleaned.recurrence_interval, 10);
    }
    return cleaned;
  };

  const createReminder = async () => {
    try {
      const cleanedData = cleanFormData(formData);
      await wellnessAPI.createReminder(cleanedData);
      await fetchReminders();
      resetForm();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder. Please try again.');
    }
  };

  const confirmUpdate = async () => {
    try {
      const cleanedData = cleanFormData(formData);
      await wellnessAPI.updateReminder(editingReminder.id, cleanedData);
      await fetchReminders();
      resetForm();
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Failed to update reminder. Please try again.');
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      reminder_type: reminder.reminder_type,
      title: reminder.title,
      description: reminder.description || '',
      scheduled_date: reminder.scheduled_date,
      scheduled_time: reminder.scheduled_time || '',
      location: reminder.location || '',
      notes: reminder.notes || '',
      is_recurring: reminder.is_recurring || false,
      recurrence_interval: reminder.recurrence_interval || '',
    });
    setShowForm(true);
  };

  const handleDeleteClick = (reminder) => {
    setReminderToDelete(reminder);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (reminderToDelete) {
      try {
        await wellnessAPI.deleteReminder(reminderToDelete.id);
        await fetchReminders();
        setReminderToDelete(null);
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleMarkComplete = async (reminder) => {
    try {
      await wellnessAPI.updateReminder(reminder.id, { status: 'completed' });
      await fetchReminders();
    } catch (error) {
      console.error('Error marking reminder complete:', error);
    }
  };

  const getReminderIcon = (type) => {
    const icons = {
      blood_test: '🩸',
      vaccination: '💉',
      checkup: '🩺',
      screening: '🔬',
      dental: '🦷',
      eye_exam: '👁️',
      custom: '📋',
    };
    return icons[type] || '📅';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: 'badge--upcoming', text: 'Upcoming' },
      completed: { class: 'badge--completed', text: 'Completed' },
      missed: { class: 'badge--missed', text: 'Missed' },
      rescheduled: { class: 'badge--rescheduled', text: 'Rescheduled' },
    };
    return badges[status] || badges.upcoming;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading reminders...</p>
      </div>
    );
  }

  return (
    <div className="reminders-page">
      <header className="reminders-page__header">
        <div>
          <h1 className="reminders-page__title">My Reminders</h1>
          <p className="reminders-page__subtitle">Manage your preventive care appointments and checkups</p>
        </div>
        <Button onClick={() => {
          if (showForm && editingReminder) {
            resetForm();
          } else {
            setShowForm(!showForm);
            setEditingReminder(null);
          }
        }}>
          {showForm ? 'Cancel' : '+ Add Reminder'}
        </Button>
      </header>

      {showForm && (
        <Card className="reminder-form-card">
          <h2 className="reminder-form__title">
            {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
          </h2>
          <form onSubmit={handleSubmit} className="reminder-form">
            <div className="reminder-form__row">
              <div className="input-group">
                <label className="input-label">Reminder Type</label>
                <select
                  name="reminder_type"
                  value={formData.reminder_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="checkup">General Checkup</option>
                  <option value="blood_test">Blood Test</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="screening">Health Screening</option>
                  <option value="dental">Dental Checkup</option>
                  <option value="eye_exam">Eye Examination</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Blood Test"
                required
              />
            </div>
            
            <div className="reminder-form__row">
              <Input
                label="Scheduled Date"
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
              />
              <Input
                label="Scheduled Time (optional)"
                type="time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
              />
              <Input
                label="Location (optional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., City Hospital"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description (optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field input-textarea"
                rows="2"
                placeholder="Add any details about this appointment..."
              />
            </div>

            <div className="input-group">
              <label className="input-label">Notes (optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field input-textarea"
                rows="2"
                placeholder="Any preparation required, documents to bring, etc."
              />
            </div>

            <div className="reminder-form__row reminder-form__row--checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                />
                <span>Recurring reminder</span>
              </label>
              {formData.is_recurring && (
                <Input
                  label="Repeat every (days)"
                  type="number"
                  name="recurrence_interval"
                  value={formData.recurrence_interval}
                  onChange={handleChange}
                  placeholder="e.g., 365 for yearly"
                />
              )}
            </div>

            <div className="reminder-form__actions">
              {editingReminder && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingReminder ? 'Update Reminder' : 'Create Reminder'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="reminders-list">
        {reminders.length > 0 ? (
          reminders.map((reminder) => {
            const statusBadge = getStatusBadge(reminder.status);
            return (
              <Card key={reminder.id} className={`reminder-item ${reminder.status === 'completed' ? 'reminder-item--completed' : ''}`}>
                <div className="reminder-item__header">
                  <span className="reminder-item__icon">{getReminderIcon(reminder.reminder_type)}</span>
                  <div className="reminder-item__info">
                    <h3 className="reminder-item__title">{reminder.title}</h3>
                    <span className="reminder-item__date">
                      📅 {formatDate(reminder.scheduled_date)}
                      {reminder.scheduled_time && ` at ${reminder.scheduled_time}`}
                    </span>
                    {reminder.location && (
                      <span className="reminder-item__location">📍 {reminder.location}</span>
                    )}
                  </div>
                  <div className="reminder-item__header-actions">
                    <span className={`reminder-item__badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                    {reminder.status !== 'completed' && (
                      <button 
                        className="reminder-item__complete-btn"
                        onClick={() => handleMarkComplete(reminder)}
                        title="Mark as complete"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="reminder-item__edit-btn"
                      onClick={() => handleEdit(reminder)}
                      title="Edit reminder"
                    >
                      ✏️
                    </button>
                    <button 
                      className="reminder-item__delete-btn"
                      onClick={() => handleDeleteClick(reminder)}
                      title="Delete reminder"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {reminder.description && (
                  <p className="reminder-item__description">{reminder.description}</p>
                )}
                
                {reminder.notes && (
                  <div className="reminder-item__notes">
                    <strong>Notes:</strong> {reminder.notes}
                  </div>
                )}

                {reminder.is_recurring && (
                  <div className="reminder-item__recurring">
                    🔄 Repeats every {reminder.recurrence_interval} days
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="no-reminders-card">
            <div className="no-reminders-content">
              <span className="no-reminders-icon">📅</span>
              <h3>No Reminders Yet</h3>
              <p>Stay on top of your preventive care by adding reminders for checkups, vaccinations, and screenings.</p>
              <Button onClick={() => setShowForm(true)}>Add Your First Reminder</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReminderToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={confirmUpdate}
        title="Update Reminder"
        message={`Are you sure you want to update "${editingReminder?.title}" with the new values?`}
        confirmText="Update"
        cancelText="Cancel"
        variant="info"
      />
    </div>
  );
};

export default Reminders;

