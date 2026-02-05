import React, { useState, useEffect } from 'react';

const BookingForm = ({ roomPrice, onBook }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [totalPrice, setTotalPrice] = useState(roomPrice);

  // Auto-calculate total price based on nights
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalPrice((diffDays > 0 ? diffDays : 1) * roomPrice);
    } else {
      setTotalPrice(roomPrice);
    }
  }, [checkIn, checkOut, roomPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates!");
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out must be after check-in!");
      return;
    }
    onBook({ checkIn, checkOut, totalPrice });
  };

  return (
    <div style={{
      marginTop: '20px',
      padding: '30px',
      backgroundColor: '#0f172a',
      color: 'white',
      borderRadius: '15px',
      maxWidth: '450px'
    }}>
      <h3 style={{ color: '#d4af37', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>
        Reserve This Room
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Check-in */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Check-in Date:</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: 'white'
            }}
            required
          />
        </div>

        {/* Check-out */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Check-out Date:</label>
          <input
            type="date"
            min={checkIn || new Date().toISOString().split('T')[0]}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: 'white'
            }}
            required
          />
        </div>

        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#d4af37'
        }}>
          Total Price: ${totalPrice}
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#d4af37',
            color: '#0f172a',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            letterSpacing: '1px'
          }}
        >
          Confirm Reservation
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
