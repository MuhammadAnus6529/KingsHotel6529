import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import logo from '../assets/logo.jpg';

const Home = ({ user }) => {
  const [filter, setFilter] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔹 Fetch rooms from backend
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('http://localhost:5000/rooms');
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error('Failed to load rooms', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 🔹 Filter logic
  const filteredRooms =
    filter === 'All'
      ? rooms
      : rooms.filter(room => room.category === filter);

  const styles = {
    hero: {
      position: 'relative',
      height: '550px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      marginBottom: '60px'
    },
    btnGold: {
      background: '#d4af37',
      color: '#0f172a',
      border: 'none',
      padding: '14px 40px',
      borderRadius: '5px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      transition: '0.3s'
    },
    welcomeBox: {
      background: 'rgba(212, 175, 55, 0.2)',
      padding: '20px 40px',
      borderRadius: '50px',
      border: '1px solid #d4af37',
      textAlign: 'center'
    },
    welcomeText: {
      margin: 0,
      fontWeight: 'bold',
      letterSpacing: '1px',
      fontSize: '1.2rem'
    },
    footer: {
      background: '#0f172a',
      color: 'white',
      padding: '60px 20px 20px 20px',
      marginTop: '80px',
      borderTop: '4px solid #d4af37'
    }
  };

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <div style={styles.hero}>
        <img
          src={logo}
          alt="Logo"
          style={{
            width: '100px',
            borderRadius: '50%',
            marginBottom: '20px',
            border: '2px solid #d4af37'
          }}
        />

        <h1 style={{ fontSize: '5rem', margin: 0, fontFamily: 'serif', letterSpacing: '8px' }}>
          KINGS HOTEL
        </h1>

        <p style={{ fontSize: '1.4rem', letterSpacing: '4px', marginBottom: '40px', fontWeight: 300 }}>
          THE PINNACLE OF LUXURY
        </p>

        {!user ? (
          // 👤 Guest view
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => navigate('/login')} style={styles.btnGold}>
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{
                ...styles.btnGold,
                background: 'transparent',
                border: '1px solid white',
                color: 'white'
              }}
            >
              Join the Royalty
            </button>
          </div>
        ) : (
          // ✅ Logged-in view
          <div style={styles.welcomeBox}>
            <p style={styles.welcomeText}>
              WELCOME BACK, {user.name ? user.name.toUpperCase() : user.email.split('@')[0].toUpperCase()}!
            </p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', fontWeight: 300 }}>
              Explore our rooms and make your next booking
            </p>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {['All', 'Standard', 'Deluxe', 'Suite'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '10px 30px',
                background: filter === cat ? '#0f172a' : 'transparent',
                color: filter === cat ? '#d4af37' : '#0f172a',
                border: '1px solid #0f172a',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '1px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading rooms...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px',
            maxWidth: '1300px',
            margin: '0 auto',
            padding: '0 20px'
          }}
        >
          {filteredRooms.map(room => (
            <RoomCard
              key={room._id}
              room={{
                id: room._id,
                type: room.category,
                price: room.price_per_night,
                desc: room.description,
                img: room.image
              }}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div
          style={{
            textAlign: 'center',
            marginTop: '60px',
            fontSize: '12px',
            color: '#475569'
          }}
        >
          © 2026 KINGS HOTEL GROUP. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default Home;
