import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-form-container">
          <div className="auth-logo">
            <span className="auth-logo__icon">🏥</span>
          </div>
          
          <h1 className="auth-title">Login</h1>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            
            <Button type="submit" fullWidth loading={loading}>
              Login
            </Button>
          </form>
          
          <div className="auth-links">
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
            <p className="auth-signup-text">
              New User? <Link to="/register" className="auth-link">Register here</Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="auth-page__right">
        <div className="auth-info">
          <h2 className="auth-info__title">Healthcare Portal</h2>
          <nav className="auth-info__nav">
            <Link to="/">Home</Link>
            <Link to="/health-topics">Health Topics</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          
          <div className="auth-info__content">
            <h3>Latest Health Information</h3>
            
            <div className="health-card">
              <h4>COVID-19 Updates</h4>
              <p>Stay informed about the latest COVID-19 guidelines and vaccination information.</p>
              <Button variant="accent" size="small">Read More</Button>
            </div>
            
            <div className="health-card">
              <h4>Seasonal Flu Prevention</h4>
              <p>Learn about steps you can take to prevent the seasonal flu and when to get vaccinated.</p>
              <Button variant="accent" size="small">Read More</Button>
            </div>
            
            <div className="health-card">
              <h4>Mental Health Awareness</h4>
              <p>Explore resources and support options for maintaining good mental health.</p>
              <Button variant="accent" size="small">Read More</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

