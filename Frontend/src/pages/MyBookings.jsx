import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.jpg';

const MyBookings = ({ user }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/my-bookings", {
          headers: { "Authorization": token }
        });

        if (res.status === 401) {
          alert("Please login to view your bookings");
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Map bookings
        const bookings = data.map(b => ({
          _id: b._id,
          roomType: b.room_id.category,
          start: new Date(b.start_time),
          end: new Date(b.end_time),
          totalPaid: b.room_id.price_per_night * Math.ceil((new Date(b.end_time) - new Date(b.start_time)) / (1000*60*60*24)),
          status: b.status.toLowerCase()
        }));

        // Auto-complete bookings that have passed
        const updatedBookings = bookings.map(b => {
          if (b.status !== "completed" && new Date() > b.end) {
            completeBooking(b._id); // backend call
            return { ...b, status: "completed" }; // update UI
          }
          return b;
        });

        setList(updatedBookings);

      } catch (err) {
        alert("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Optional: auto-refresh every minute to check for new completions
    const interval = setInterval(fetchBookings, 60000);
    return () => clearInterval(interval);

  }, [user]);

  // Cancel booking
  const cancel = async (id) => {
    if (!window.confirm("Are you sure you wish to withdraw your royal reservation?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { "Authorization": token }
      });

      if (!res.ok) {
        alert("Cancellation failed");
        return;
      }

      setList(prev => prev.filter(b => b._id !== id));
    } catch {
      alert("Server error");
    }
  };

  // Auto-complete booking in backend
  const completeBooking = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/bookings/${id}/complete`, {
        method: "PATCH",
        headers: { "Authorization": token }
      });
    } catch {
      console.error("Failed to auto-complete booking:", id);
    }
  };

  const styles = {
    container: { padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '80vh', fontFamily: "'Playfair Display', serif" },
    ticket: { background: 'white', border: '1px solid #d4af37', borderRadius: '15px', marginBottom: '30px', display: 'flex', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', position: 'relative' },
    leftSection: { background: '#0f172a', color: 'white', padding: '30px', width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '2px dashed #d4af37' },
    rightSection: { padding: '30px', width: '70%' },
    cancelBtn: { background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    statusBadge: { marginTop: '10px', fontSize: '12px', fontWeight: 'bold', color: '#d4af37' }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading your royal reservations...</div>;

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#d4af37' }}>Your Royal Itinerary</h1>

      {list.length > 0 ? (
        list.map(b => (
          <div key={b._id} style={styles.ticket}>
            <div style={styles.leftSection}>
              <img src={logo} alt="logo" style={{ width: '60px', borderRadius: '50%' }} />
              <p style={styles.statusBadge}>{b.status.toUpperCase()}</p>
            </div>

            <div style={styles.rightSection}>
              <h3>{b.roomType} Suite</h3>
              <p>Check-in: <b>{b.start.toLocaleDateString()}</b></p>
              <p>Check-out: <b>{b.end.toLocaleDateString()}</b></p>
              <p>Total Paid: <b>${b.totalPaid}</b></p>

              {b.status === "confirmed" && (
                <button onClick={() => cancel(b._id)} style={styles.cancelBtn}>WITHDRAW RESERVATION</button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed #cbd5e1' }}>
          <p>No active royal reservations.</p>
          <button onClick={() => window.location.href = '/'} style={{ background: '#d4af37', border: 'none', padding: '10px 25px', cursor: 'pointer' }}>Explore Rooms</button>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
