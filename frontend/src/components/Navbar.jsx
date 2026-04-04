import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaDownload } from 'react-icons/fa';
import AppDownloadForm from './AppDownloadForm';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Franchise', path: '/franchise' },
    { name: 'Features', path: '/features' },
    { name: 'Categories', path: '/categories' },
    { name: 'About us', path: '/about-us' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <div className="logo">
            <Link to="/" onClick={closeMenu}>
              <img
                src="/flyHub_logo.svg"
                alt="FlyHub Logo"
                className="logo-image"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="hamburger-box">
              <div className="hamburger-inner"></div>
            </div>
          </button>

          {/* Navigation Content */}
          <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={location.pathname === link.path ? 'active' : ''}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="nav-actions">
              <button
                className="play-store-btn"
                onClick={() => {
                  closeMenu();
                  setIsFormOpen(true);
                }}
              >
                <FaDownload className="play-icon" />
                <span>Get the App</span>
              </button>
            </div>
          </div>

          {/* Overlay for mobile when menu is open */}
          {isMenuOpen && (
            <div className="menu-overlay active" onClick={closeMenu}></div>
          )}
        </div>
      </nav>

      {/* Lead Capture Modal moved outside the nav container */}
      <AppDownloadForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
};

export default Navbar;
