import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg'; 
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 850); // Slightly wider threshold

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
      if (window.innerWidth > 850) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles = {
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 5%',
      background: 'rgba(15, 23, 42, 0.95)',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
      height: '70px'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer'
    },
    logoImg: { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #d4af37' },
    navLinks: {
      display: 'flex',
      gap: '25px',
      alignItems: 'center'
    },
    mobileMenu: {
      position: 'fixed',
      top: 0,
      right: menuOpen ? 0 : '-100%',
      width: '280px',
      height: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 30px',
      gap: '20px',
      transition: '0.4s ease-in-out',
      zIndex: 1001,
      boxShadow: '-5px 0 15px rgba(0,0,0,0.5)'
    },
    link: {
      color: '#cbd5e1',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      transition: '0.3s',
    },
    logoutBtn: {
      background: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      padding: '8px 15px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      marginTop: isMobile ? '10px' : '0'
    },
    loginBtn: {
      background: '#d4af37',
      color: '#0f172a',
      padding: '10px 20px',
      borderRadius: '5px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '14px',
      textAlign: 'center'
    },
    hamburger: {
      fontSize: '24px',
      cursor: 'pointer',
      color: '#d4af37',
      display: 'flex',
      alignItems: 'center'
    },
    userInfo: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '15px',
      borderLeft: isMobile ? 'none' : '1px solid #334155',
      paddingLeft: isMobile ? '0' : '20px',
      marginTop: isMobile ? '20px' : '0',
      borderTop: isMobile ? '1px solid #334155' : 'none',
      paddingTop: isMobile ? '20px' : '0'
    }
  };

  return (
    <>
      <nav style={styles.nav}>
        {/* Logo */}
        <div style={styles.logoContainer} onClick={() => { navigate('/'); setMenuOpen(false); }}>
          <img src={logo} alt="Kings Logo" style={styles.logoImg} />
          <h2 style={{ margin: 0, fontFamily: 'serif', fontSize: isMobile ? '16px' : '20px', letterSpacing: '2px', color: '#d4af37' }}>
            KINGS HOTEL
          </h2>
        </div>

        {/* Desktop Links */}
        {!isMobile && (
          <div style={styles.navLinks}>
            <Link to="/" style={styles.link}>Home</Link>
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Link to="/admin" style={{ ...styles.link, color: '#d4af37' }}>Admin</Link>
                    <Link to="/my-bookings" style={{ ...styles.link, color: '#d4af37' }}>Bookings</Link>
                  </>
                ) : (
                  <Link to="/my-bookings" style={styles.link}>My Stays</Link>
                )}
                <div style={styles.userInfo}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</span>
                  <button onClick={handleLogout} style={styles.logoutBtn}>LOGOUT</button>
                </div>
              </>
            ) : (
              <Link to="/login" style={styles.loginBtn}>LOGIN</Link>
            )}
          </div>
        )}

        {/* Hamburger Icon */}
        {isMobile && (
          <div style={styles.hamburger} onClick={toggleMenu}>
            <FaBars />
          </div>
        )}
      </nav>

      {/* Mobile Sidebar Menu */}
      <div style={styles.mobileMenu}>
        <div style={{ alignSelf: 'flex-end', cursor: 'pointer', color: '#d4af37', fontSize: '28px' }} onClick={toggleMenu}>
          <FaTimes />
        </div>
        
        <Link to="/" style={styles.link} onClick={toggleMenu}>Home</Link>

        {user ? (
          <>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin" style={{ ...styles.link, color: '#d4af37' }} onClick={toggleMenu}>Admin Panel</Link>
                <Link to="/my-bookings" style={{ ...styles.link, color: '#d4af37' }} onClick={toggleMenu}>Test Bookings</Link>
              </>
            ) : (
              <Link to="/my-bookings" style={styles.link} onClick={toggleMenu}>My Stays</Link>
            )}
            <div style={styles.userInfo}>
              <span style={{ fontSize: '13px', color: '#94a3b8', wordBreak: 'break-all' }}>{user.email}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>LOGOUT</button>
            </div>
          </>
        ) : (
          <Link to="/login" style={styles.loginBtn} onClick={toggleMenu}>LOGIN</Link>
        )}
      </div>

      {/* Overlay to close menu when clicking outside */}
      {menuOpen && (
        <div 
          onClick={toggleMenu}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 1000
          }}
        />
      )}
    </>
  );
};

export default Navbar;