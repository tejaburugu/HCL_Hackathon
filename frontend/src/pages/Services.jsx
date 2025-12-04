import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: '🎯',
      title: 'Wellness Goal Tracking',
      description: 'Set and track daily wellness goals including steps, sleep, water intake, and more. Get personalized insights to help you stay on track.',
      features: ['Daily goal setting', 'Progress tracking', 'Visual analytics', 'Achievement badges']
    },
    {
      icon: '📅',
      title: 'Preventive Care Reminders',
      description: 'Never miss an important health checkup or vaccination. Our reminder system keeps you on top of your preventive care schedule.',
      features: ['Appointment reminders', 'Vaccination schedules', 'Health screening alerts', 'Custom notifications']
    },
    {
      icon: '👨‍⚕️',
      title: 'Provider Connection',
      description: 'Stay connected with your healthcare providers. Share your wellness progress and receive personalized guidance.',
      features: ['Secure messaging', 'Progress sharing', 'Care coordination', 'Health reports']
    },
    {
      icon: '📊',
      title: 'Health Dashboard',
      description: 'Get a comprehensive view of your health metrics in one place. Track trends and identify patterns in your wellness journey.',
      features: ['Unified dashboard', 'Trend analysis', 'Weekly summaries', 'Health insights']
    },
    {
      icon: '📚',
      title: 'Health Education',
      description: 'Access a library of health articles and resources curated by medical professionals to help you make informed decisions.',
      features: ['Expert articles', 'Video content', 'Health tips', 'FAQ section']
    },
    {
      icon: '🔒',
      title: 'HIPAA Compliant Security',
      description: 'Your health data is protected with enterprise-grade security. We follow HIPAA guidelines to ensure your information stays private.',
      features: ['Data encryption', 'Access controls', 'Audit logging', 'Secure storage']
    }
  ];

  const providers = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Primary Care Physician',
      image: '👩‍⚕️',
      experience: '15+ years experience',
      rating: 4.9
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      image: '👨‍⚕️',
      experience: '12+ years experience',
      rating: 4.8
    },
    {
      name: 'Dr. Emily Williams',
      specialty: 'Nutritionist',
      image: '👩‍⚕️',
      experience: '10+ years experience',
      rating: 4.9
    },
    {
      name: 'Dr. James Brown',
      specialty: 'General Practitioner',
      image: '👨‍⚕️',
      experience: '20+ years experience',
      rating: 4.7
    }
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero__content">
          <h1 className="services-hero__title">Our Services</h1>
          <p className="services-hero__subtitle">
            Comprehensive healthcare solutions designed to help you achieve optimal wellness
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-heading">What We Offer</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <Card key={index} className="service-card">
                <span className="service-card__icon">{service.icon}</span>
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <ul className="service-card__features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Providers */}
      <section className="providers-section">
        <div className="container">
          <h2 className="section-heading">Our Healthcare Providers</h2>
          <p className="section-subheading">
            Meet our team of experienced healthcare professionals dedicated to your wellbeing
          </p>
          <div className="providers-grid">
            {providers.map((provider, index) => (
              <Card key={index} className="provider-card">
                <div className="provider-card__image">{provider.image}</div>
                <h3 className="provider-card__name">{provider.name}</h3>
                <p className="provider-card__specialty">{provider.specialty}</p>
                <p className="provider-card__experience">{provider.experience}</p>
                <div className="provider-card__rating">
                  ⭐ {provider.rating} Rating
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <h2 className="services-cta__title">Ready to Start Your Wellness Journey?</h2>
          <p className="services-cta__text">
            Join thousands of patients who are taking control of their health with our platform.
          </p>
          <div className="services-cta__buttons">
            <Link to="/register">
              <Button size="large">Get Started Free</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="large">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

