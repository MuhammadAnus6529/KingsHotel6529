import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000); // Wait for fade
    }, 3000); // show splash for 3s

    return () => clearTimeout(timer);
  }, [onComplete]);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      transition: 'opacity 1s ease-in-out',
      opacity: fadeOut ? 0 : 1,
      overflow: 'hidden'
    },
    logo: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      border: '3px solid #d4af37',
      padding: '5px',
      marginBottom: '30px',
      animation: 'pulse 2s infinite ease-in-out, glow 3s infinite alternate'
    },
    text: {
      color: '#d4af37',
      fontFamily: "'Playfair Display', serif",
      fontSize: '2.5rem',
      letterSpacing: '8px',
      margin: 0,
      textAlign: 'center',
      opacity: 0,
      animation: 'fadeInUp 1.2s forwards 0.5s'
    },
    tagline: {
      color: 'white',
      fontSize: '14px',
      letterSpacing: '4px',
      marginTop: '10px',
      opacity: 0,
      animation: 'fadeInUp 1.2s forwards 0.8s'
    },
    loadingLine: {
      width: '120px',
      height: '2px',
      background: '#d4af37',
      marginTop: '40px',
      borderRadius: '1px',
      position: 'relative',
      overflow: 'hidden'
    },
    loadingBar: {
      position: 'absolute',
      width: '60px',
      height: '100%',
      background: 'linear-gradient(90deg, #fff, #d4af37, #fff)',
      animation: 'load 1.5s infinite linear'
    },
    particle: {
      position: 'absolute',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#d4af37',
      opacity: 0.8,
      animation: 'float 3s infinite ease-in-out'
    }
  };

  // generate floating particles
  const particles = Array.from({ length: 12 }).map((_, i) => (
    <div
      key={i}
      style={{
        ...styles.particle,
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`
      }}
    />
  ));

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          @keyframes glow {
            0% { box-shadow: 0 0 10px #d4af37; }
            50% { box-shadow: 0 0 25px #d4af37; }
            100% { box-shadow: 0 0 10px #d4af37; }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes load {
            0% { left: -60px; }
            100% { left: 120px; }
          }
          @keyframes float {
            0% { transform: translateY(0px) scale(0.8); opacity: 0.6; }
            50% { transform: translateY(-20px) scale(1); opacity: 1; }
            100% { transform: translateY(0px) scale(0.8); opacity: 0.6; }
          }
        `}
      </style>

      {/* floating particles */}
      {particles}

      <img src={logo} alt="Kings Hotel Logo" style={styles.logo} />
      <h1 style={styles.text}>KINGS HOTEL</h1>
      <p style={styles.tagline}>ESTABLISHED 2026</p>

      <div style={styles.loadingLine}>
        <div style={styles.loadingBar}></div>
      </div>
    </div>
  );
};

export default SplashScreen;
