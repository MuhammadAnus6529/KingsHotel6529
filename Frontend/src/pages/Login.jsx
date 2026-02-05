import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const navigate = useNavigate();

  // Listen for screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      const userInfo = { email, role: data.role };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      navigate(data.role === 'admin' ? '/admin' : '/');

    } catch (err) {
      console.error(err);
      alert('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: isMobile ? '15px' : '40px',
      fontFamily: "'Playfair Display', serif",
      boxSizing: 'border-box'
    },
    backBtn: {
      position: 'absolute',
      top: isMobile ? '15px' : '30px',
      left: isMobile ? '15px' : '30px',
      background: 'rgba(15, 23, 42, 0.6)',
      color: '#d4af37',
      border: '1px solid #d4af37',
      padding: '8px 16px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      backdropFilter: 'blur(5px)',
      zIndex: 10
    },
    card: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '24px',
      padding: isMobile ? '30px 20px' : '40px',
      width: '100%',
      maxWidth: '450px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    },
    logo: {
      width: isMobile ? '80px' : '110px',
      height: isMobile ? '80px' : '110px',
      borderRadius: '50%',
      border: '2px solid #d4af37',
      marginBottom: '20px'
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '15px'
    },
    input: {
      width: '100%',
      padding: '14px 45px 14px 14px',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      color: 'white',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none'
    },
    eyeIcon: {
      position: 'absolute',
      top: '50%',
      right: '15px',
      transform: 'translateY(-50%)',
      color: '#d4af37',
      cursor: 'pointer',
      fontSize: '18px'
    },
    button: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#d4af37',
      color: '#0f172a',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '900',
      fontSize: '14px',
      cursor: 'pointer',
      letterSpacing: '2px',
      marginTop: '10px',
      transition: '0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>
        ← Back
      </button>

      <div style={styles.card}>
        <img src={logo} alt="Kings Hotel" style={styles.logo} />

        <h2 style={{ 
          color: '#d4af37', 
          letterSpacing: isMobile ? '2px' : '4px', 
          fontSize: isMobile ? '1.5rem' : '2rem',
          marginBottom: '10px',
          marginRight: 0,
          marginLeft: 0
        }}>
          WELCOME BACK
        </h2>
        <p style={{ color: '#94a3b8', fontStyle: 'italic', marginBottom: '25px', fontSize: '14px' }}>
          Sign in to your Royal Suite
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email Address"
              style={styles.input}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Secret Password"
              style={styles.input}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>

        <div style={{ marginTop: '25px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            First time at Kings Hotel?{' '}
            <Link to="/signup" style={{ color: '#d4af37', fontWeight: 'bold', textDecoration: 'none' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;