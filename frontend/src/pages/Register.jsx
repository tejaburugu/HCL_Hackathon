import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'patient', // Fixed as patient - providers are added by admin
    phone: '',
    data_consent: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }
    if (!formData.data_consent) {
      newErrors.data_consent = 'You must consent to data usage to register';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      const responseErrors = err.response?.data || {};
      setErrors(responseErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-page__left">
        <div className="auth-form-container auth-form-container--wide">
          <div className="auth-logo">
            <span className="auth-logo__icon">🏥</span>
          </div>
          
          <h1 className="auth-title">Create Your Patient Account</h1>
          <p className="auth-subtitle">Join our healthcare portal to manage your wellness journey</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form__row">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <Input
              label="Phone (Optional)"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            
            <div className="auth-form__row">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                error={errors.password_confirm}
                required
              />
            </div>
            
            <div className="consent-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="data_consent"
                  checked={formData.data_consent}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  I consent to the collection and use of my health data in accordance with the{' '}
                  <Link to="/privacy">Privacy Policy</Link>. I understand how my data will be protected and used.
                </span>
              </label>
              {errors.data_consent && (
                <span className="input-error">{errors.data_consent}</span>
              )}
            </div>
            
            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
          
          <p className="auth-signup-text">
            Already have an account? <Link to="/login" className="auth-link">Login here</Link>
          </p>
          
          <p className="auth-provider-note">
            Are you a healthcare provider? <Link to="/contact" className="auth-link">Contact us</Link> to get access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
