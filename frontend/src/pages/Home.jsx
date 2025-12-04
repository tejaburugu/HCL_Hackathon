import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthAPI } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import './Home.css';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await healthAPI.getLatestArticles();
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <h1 className="hero__title">Your Health, Our Priority</h1>
          <p className="hero__subtitle">
            A comprehensive wellness and preventive care portal designed to help you 
            achieve your health goals and stay on top of your preventive care.
          </p>
          <div className="hero__actions">
            <Link to="/register">
              <Button variant="accent" size="large">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="large">Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <h2 className="section-title">Why Choose Our Portal?</h2>
          <div className="features__grid">
            <Card className="feature-card">
              <span className="feature-card__icon">🎯</span>
              <h3 className="feature-card__title">Track Wellness Goals</h3>
              <p className="feature-card__desc">
                Set and monitor your daily health goals including steps, sleep, and active time.
              </p>
            </Card>
            <Card className="feature-card">
              <span className="feature-card__icon">🔔</span>
              <h3 className="feature-card__title">Preventive Care Reminders</h3>
              <p className="feature-card__desc">
                Never miss an important checkup with personalized preventive care reminders.
              </p>
            </Card>
            <Card className="feature-card">
              <span className="feature-card__icon">🔒</span>
              <h3 className="feature-card__title">Secure & Private</h3>
              <p className="feature-card__desc">
                Your health data is protected with HIPAA-compliant security measures.
              </p>
            </Card>
            <Card className="feature-card">
              <span className="feature-card__icon">👨‍⚕️</span>
              <h3 className="feature-card__title">Provider Connection</h3>
              <p className="feature-card__desc">
                Stay connected with your healthcare provider for better care coordination.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Health Information Section */}
      <section className="health-info">
        <div className="health-info__container">
          <h2 className="section-title">Latest Health Information</h2>
          <div className="health-info__grid">
            {articles.map((article) => (
              <Card key={article.id} className="article-card">
                <div className="article-card__category">{article.category.replace('_', ' ')}</div>
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__summary">{article.summary}</p>
                <Link to={`/articles/${article.slug}`}>
                  <Button variant="accent" size="small">Read More</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta__container">
          <h2 className="cta__title">Ready to Take Control of Your Health?</h2>
          <p className="cta__desc">
            Join thousands of users who are already managing their wellness journey with our portal.
          </p>
          <Link to="/register">
            <Button variant="primary" size="large">Create Your Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

