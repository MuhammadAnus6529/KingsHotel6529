import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '15px', 
      overflow: 'hidden', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <img src={room.img} alt={room.type} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#1a2a6c' }}>{room.type} Room</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>{room.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#d4af37' }}>${room.price}/night</span>
          <button 
            onClick={() => navigate(`/room/${room.id}`)}
            style={{ 
              padding: '8px 20px', 
              backgroundColor: '#1a2a6c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;