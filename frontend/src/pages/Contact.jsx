import { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to an API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: 'general', message: '' });
  };

  const contactInfo = [
    {
      icon: '📍',
      title: 'Address',
      content: '123 Healthcare Boulevard\nMedical District, MD 12345'
    },
    {
      icon: '📞',
      title: 'Phone',
      content: '+1 (555) 123-4567\nMon-Fri 9AM-6PM EST'
    },
    {
      icon: '✉️',
      title: 'Email',
      content: 'support@healthcareportal.com\ninfo@healthcareportal.com'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      content: 'Available 24/7\nfor urgent inquiries'
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click on "Get Started" or "Register" and fill out the patient registration form. You\'ll receive a confirmation email to activate your account.'
    },
    {
      question: 'Is my health data secure?',
      answer: 'Yes! We use enterprise-grade encryption and follow HIPAA guidelines to ensure your health information remains private and secure.'
    },
    {
      question: 'Can I connect with my doctor through the platform?',
      answer: 'Yes, if your healthcare provider is registered on our platform, you can share your wellness progress and receive personalized guidance.'
    },
    {
      question: 'How do I become a healthcare provider on this platform?',
      answer: 'Healthcare providers can contact us through this form or email us directly. We verify credentials before granting provider access.'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero__content">
          <h1 className="contact-hero__title">Contact Us</h1>
          <p className="contact-hero__subtitle">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <section className="contact-info-section">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <Card key={index} className="contact-info-card">
                <span className="contact-info-card__icon">{info.icon}</span>
                <h3 className="contact-info-card__title">{info.title}</h3>
                <p className="contact-info-card__content">{info.content}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form & FAQ */}
        <div className="contact-main">
          {/* Contact Form */}
          <section className="contact-form-section">
            <Card className="contact-form-card">
              <h2 className="contact-form__title">Send us a Message</h2>
              
              {submitted ? (
                <div className="contact-success">
                  <span className="contact-success__icon">✅</span>
                  <h3>Thank you for your message!</h3>
                  <p>We'll get back to you within 24-48 hours.</p>
                  <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-form__row">
                    <Input
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="provider">Healthcare Provider Access</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="input-field input-textarea"
                      rows="5"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <Button type="submit" fullWidth>
                    Send Message
                  </Button>
                </form>
              )}
            </Card>
          </section>

          {/* FAQ Section */}
          <section className="faq-section">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <Card key={index} className="faq-card">
                  <h3 className="faq-card__question">{faq.question}</h3>
                  <p className="faq-card__answer">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Map Section (placeholder) */}
      <section className="map-section">
        <div className="map-placeholder">
          <span className="map-placeholder__icon">🗺️</span>
          <p>Interactive map would be displayed here</p>
          <p className="map-placeholder__address">123 Healthcare Boulevard, Medical District, MD 12345</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;

