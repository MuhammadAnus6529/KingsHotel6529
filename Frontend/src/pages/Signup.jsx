import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'phone') {
      const regex = /^[0-9]*$/;
      setPhoneError(!regex.test(value) ? 'Only numbers are allowed' : '');
    }

    if (name === 'email') {
      setEmailError('');
      setEmailAvailable(false);
      if (!value) return;

      const regex = /^\S+@\S+\.\S+$/;
      if (!regex.test(value)) {
        setEmailError('Invalid email format');
        return;
      }

      setCheckingEmail(true);
      try {
        const res = await fetch(`http://localhost:5000/check-email?email=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (data.exists) {
          setEmailError('Email already in use');
          setEmailAvailable(false);
        } else {
          setEmailError('');
          setEmailAvailable(true);
        }
      } catch (err) {
        setEmailError('Error checking email');
        setEmailAvailable(false);
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (phoneError || emailError || !emailAvailable) {
      alert('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Signup failed');
        return;
      }
      alert('🎉 Account created successfully!');
      navigate('/login');
    } catch {
      alert('Server error');
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
      backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: isMobile ? '60px 15px 20px 15px' : '40px 20px',
      fontFamily: "'Playfair Display', serif",
      boxSizing: 'border-box'
    },
    backBtn: {
      position: 'absolute',
      top: isMobile ? '15px' : '30px',
      left: isMobile ? '15px' : '30px',
      background: 'rgba(15, 23, 42, 0.7)',
      color: '#d4af37',
      border: '1px solid #d4af37',
      padding: '8px 20px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      backdropFilter: 'blur(5px)',
      zIndex: 10
    },
    card: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '24px',
      padding: isMobile ? '25px 20px' : '40px',
      width: '100%',
      maxWidth: '480px',
      textAlign: 'center',
      boxSizing: 'border-box',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    },
    logo: { 
      width: isMobile ? '70px' : '100px', 
      height: isMobile ? '70px' : '100px', 
      borderRadius: '50%', 
      border: '2px solid #d4af37', 
      marginBottom: '15px' 
    },
    inputGroup: { position: 'relative', marginBottom: isMobile ? '12px' : '18px' },
    input: { 
      width: '100%', 
      padding: '12px 40px 12px 14px', 
      background: '#1e293b', 
      border: '1px solid #334155', 
      borderRadius: '10px', 
      color: 'white', 
      fontSize: '15px', 
      boxSizing: 'border-box',
      outline: 'none'
    },
    eyeIcon: { position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', color: '#d4af37', cursor: 'pointer' },
    button: { 
      width: '100%', 
      padding: '15px', 
      backgroundColor: '#d4af37', 
      color: '#0f172a', 
      border: 'none', 
      borderRadius: '10px', 
      fontWeight: '900', 
      fontSize: '14px', 
      cursor: 'pointer', 
      letterSpacing: '2px', 
      marginTop: '10px',
      transition: '0.3s'
    },
    statusText: { 
      fontSize: '11px', 
      marginTop: '4px', 
      textAlign: 'left', 
      display: 'block',
      marginLeft: '5px'
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>
        {isMobile ? '← Home' : '← Return Home'}
      </button>
      
      <div style={styles.card}>
        <img src={logo} alt="Kings Hotel" style={styles.logo} />
        
        <h2 style={{ 
          color: '#d4af37', 
          letterSpacing: isMobile ? '2px' : '4px', 
          fontSize: isMobile ? '1.4rem' : '1.8rem',
          marginBottom: '5px' 
        }}>
          JOIN THE ROYALTY
        </h2>
        <p style={{ color: '#94a3b8', fontStyle: 'italic', marginBottom: '20px', fontSize: '14px' }}>
          Create your Kings Hotel account
        </p>

        <form onSubmit={handleSignup}>
          <div style={styles.inputGroup}>
            <input type="text" name="name" placeholder="Full Name" style={styles.input} required onChange={handleChange} />
          </div>

          <div style={styles.inputGroup}>
            <input type="email" name="email" placeholder="Email Address" style={styles.input} required value={form.email} onChange={handleChange} />
            {checkingEmail && <span style={{...styles.statusText, color: '#d4af37'}}>Verifying...</span>}
            {emailError && <span style={{...styles.statusText, color: '#ef4444'}}>{emailError}</span>}
            {!emailError && emailAvailable && !checkingEmail && <span style={{...styles.statusText, color: '#22c55e'}}>✓ Email Available</span>}
          </div>

          <div style={styles.inputGroup}>
            <input type="tel" name="phone" placeholder="Phone Number" style={styles.input} value={form.phone} onChange={handleChange} />
            {phoneError && <span style={{...styles.statusText, color: '#ef4444'}}>{phoneError}</span>}
          </div>

          <div style={styles.inputGroup}>
            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create Password" style={styles.input} required onChange={handleChange} />
            <div style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" style={styles.input} required onChange={handleChange} />
            <div style={styles.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading || phoneError || emailError || checkingEmail || !emailAvailable}>
            {loading ? 'PROCESSING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>
            Already a member? <Link to="/login" style={{ color: '#d4af37', fontWeight: 'bold', textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;