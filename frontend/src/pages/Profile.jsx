import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    // Patient specific
    blood_type: '',
    height: '',
    weight: '',
    allergies: '',
    current_medications: '',
    medical_conditions: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        const { user: userData, profile: profileData } = response.data;
        
        setProfile(profileData);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          emergency_contact: userData.emergency_contact || '',
          emergency_phone: userData.emergency_phone || '',
          blood_type: profileData?.blood_type || '',
          height: profileData?.height || '',
          weight: profileData?.weight || '',
          allergies: profileData?.allergies || '',
          current_medications: profileData?.current_medications || '',
          medical_conditions: profileData?.medical_conditions || '',
        });
      } catch (error) {
        // Use user data from context if API fails
        setFormData({
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          phone: user?.phone || '',
          address: '',
          emergency_contact: '',
          emergency_phone: '',
          blood_type: '',
          height: '',
          weight: '',
          allergies: '',
          current_medications: '',
          medical_conditions: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowUpdateModal(true);
  };

  const confirmUpdate = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,
        profile: {
          blood_type: formData.blood_type,
          height: formData.height,
          weight: formData.weight,
          allergies: formData.allergies,
          current_medications: formData.current_medications,
          medical_conditions: formData.medical_conditions,
        },
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      updateUser({ ...user, first_name: formData.first_name, last_name: formData.last_name });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <h1 className="profile-page__title">My Profile</h1>
        <p className="profile-page__subtitle">Manage your personal and health information</p>
      </header>

      {message.text && (
        <div className={`profile-message profile-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'personal' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        {user?.role === 'patient' && (
          <button 
            className={`profile-tab ${activeTab === 'health' ? 'profile-tab--active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            Health Info
          </button>
        )}
        <button 
          className={`profile-tab ${activeTab === 'emergency' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          Emergency Contact
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'personal' && (
          <Card className="profile-section">
            <h2 className="profile-section__title">Personal Information</h2>
            <div className="profile-form">
              <div className="profile-form__row">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
              />
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <div className="input-group">
                <label className="input-label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field input-textarea"
                  rows="3"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'health' && user?.role === 'patient' && (
          <Card className="profile-section">
            <h2 className="profile-section__title">Health Information</h2>
            <div className="profile-form">
              <div className="profile-form__row">
                <div className="input-group">
                  <label className="input-label">Blood Type</label>
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <Input
                  label="Height (cm)"
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="input-field input-textarea"
                  rows="3"
                  placeholder="List any allergies (food, medication, environmental...)"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Current Medications</label>
                <textarea
                  name="current_medications"
                  value={formData.current_medications}
                  onChange={handleChange}
                  className="input-field input-textarea"
                  rows="3"
                  placeholder="List any medications you're currently taking"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Medical Conditions</label>
                <textarea
                  name="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={handleChange}
                  className="input-field input-textarea"
                  rows="3"
                  placeholder="List any existing medical conditions"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'emergency' && (
          <Card className="profile-section">
            <h2 className="profile-section__title">Emergency Contact</h2>
            <div className="profile-form">
              <Input
                label="Emergency Contact Name"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                placeholder="Full name of emergency contact"
              />
              <Input
                label="Emergency Contact Phone"
                type="tel"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>
          </Card>
        )}

        <div className="profile-actions">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={confirmUpdate}
        title="Update Profile"
        message="Are you sure you want to save these changes to your profile?"
        confirmText="Save Changes"
        cancelText="Cancel"
        variant="info"
      />
    </div>
  );
};

export default Profile;
