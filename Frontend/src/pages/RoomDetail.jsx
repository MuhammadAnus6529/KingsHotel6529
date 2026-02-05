import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RoomDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/rooms/${id}`);
        const data = await res.json();
        setRoom(data);
        setTotalPrice(data.price_per_night);
      } catch {
        alert("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // 🔹 Calculate total price
  useEffect(() => {
    if (startDate && endDate && room) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setTotalPrice((diffDays > 0 ? diffDays : 1) * room.price_per_night);
    }
  }, [startDate, endDate, room]);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (!room) return <p style={{ textAlign: 'center' }}>Room not found</p>;

  // 🔹 Booking handler
  const handleBooking = async () => {
    if (!user) {
      alert("You need to login to book a room.");
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      alert("Check-out date must be after check-in");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"), // your token
        },
        body: JSON.stringify({
          room_id: room._id,
          start_time: startDate,
          end_time: endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      alert("🎉 Reservation Confirmed!");
      navigate("/my-bookings");
    } catch {
      alert("Booking failed due to server error");
    }
  };

  const styles = {
    container: {
      maxWidth: '1100px',
      margin: '40px auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '40px',
      padding: '20px'
    },
    image: {
      width: '100%',
      borderRadius: '20px',
      height: '450px',
      objectFit: 'cover'
    },
    bookingCard: {
      background: '#0f172a',
      color: 'white',
      padding: '30px',
      borderRadius: '20px',
      border: '1px solid #d4af37'
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '10px 0 20px 0',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#1e293b',
      color: 'white'
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: '#d4af37',
      cursor: 'pointer',
      marginBottom: '20px',
      fontSize: '1rem'
    },
    totalBox: {
      borderTop: '1px solid #334155',
      paddingTop: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#d4af37'
    },
    bookBtn: {
      width: '100%',
      padding: '16px',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 'bold',
      marginTop: '30px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      {/* Room Details */}
      <div>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back to Collection
        </button>

        <img src={room.image} alt={room.category} style={styles.image} />

        <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginTop: '30px', color: '#0f172a' }}>
          {room.category} Room
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.8' }}>
          {room.description}
        </p>
      </div>

      {/* Booking Card */}
      <div style={styles.bookingCard}>
        <h2 style={{ color: '#d4af37', fontFamily: 'serif', marginTop: 0 }}>Reserve</h2>

        <label>CHECK-IN DATE</label>
        <input
          type="date"
          style={styles.input}
          min={new Date().toISOString().split('T')[0]}
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <label>CHECK-OUT DATE</label>
        <input
          type="date"
          style={styles.input}
          min={startDate}
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <div style={styles.totalBox}>
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>

        <button
          onClick={handleBooking}
          disabled={!startDate || !endDate}
          style={{
            ...styles.bookBtn,
            backgroundColor: user && startDate && endDate ? '#d4af37' : '#334155',
            color: '#0f172a'
          }}
        >
          {user ? 'Confirm Reservation' : 'Login to Book'}
        </button>
      </div>
    </div>
  );
};

export default RoomDetail;
