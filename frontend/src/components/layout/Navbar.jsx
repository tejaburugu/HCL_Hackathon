import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  const publicLinks = [
    { path: '/', label: 'Home' },
    { path: '/health-topics', label: 'Health Topics' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar__container">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">🏥</span>
            <span className="navbar__logo-text">Healthcare Portal</span>
          </Link>

          <nav className="navbar__nav">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="navbar__link">
                  Dashboard
                </Link>
                <div className="navbar__user">
                  <span className="navbar__user-name">
                    {user?.first_name || 'User'}
                  </span>
                  <button onClick={handleLogoutClick} className="navbar__logout">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="navbar__login-btn">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="warning"
      />
    </>
  );
};

export default Navbar;
