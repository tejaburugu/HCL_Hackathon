import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './HealthTopics.css';

const HealthTopics = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'covid', label: 'COVID-19' },
    { id: 'flu', label: 'Seasonal Flu' },
    { id: 'mental_health', label: 'Mental Health' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'fitness', label: 'Fitness' },
  ];

  useEffect(() => {
    fetchArticles();
  }, [activeCategory]);

  const fetchArticles = async () => {
    try {
      const params = activeCategory !== 'all' ? { category: activeCategory } : {};
      const response = await healthAPI.getArticles(params);
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="health-topics-page">
      <header className="health-topics__header">
        <h1 className="health-topics__title">Health Topics</h1>
        <p className="health-topics__subtitle">
          Browse our library of health information and resources
        </p>
      </header>

      <div className="health-topics__categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${activeCategory === cat.id ? 'category-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading articles...</p>
        </div>
      ) : (
        <div className="articles-grid">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="article-card">
              {article.is_featured && (
                <span className="article-card__featured">Featured</span>
              )}
              <span className="article-card__category">
                {article.category.replace('_', ' ')}
              </span>
              <h2 className="article-card__title">{article.title}</h2>
              <p className="article-card__summary">{article.summary}</p>
              <Link to={`/articles/${article.slug}`}>
                <Button variant="accent" size="small">Read More</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredArticles.length === 0 && (
        <Card className="no-articles">
          <p>No articles found in this category.</p>
        </Card>
      )}
    </div>
  );
};

export default HealthTopics;

