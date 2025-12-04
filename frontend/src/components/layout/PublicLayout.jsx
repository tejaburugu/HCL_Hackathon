import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './PublicLayout.css';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-layout__main">
        <Outlet />
      </main>
      <footer className="public-layout__footer">
        <div className="footer__container">
          <div className="footer__brand">
            <span>🏥</span>
            <span>Healthcare Portal</span>
          </div>
          <div className="footer__links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
          <p className="footer__copyright">
            © 2024 Healthcare Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

