import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ category: "", price_per_night: "", description: "", image: "" });
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const categories = ["Suite", "Deluxe", "Royal", "Standard"];
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    const fetchData = async () => {
      try {
        const [bookingsRes, roomsRes] = await Promise.all([
          fetch("http://localhost:5000/admin/bookings", { headers: { Authorization: token } }),
          fetch("http://localhost:5000/rooms"),
        ]);
        setBookings(await bookingsRes.json());
        setRooms(await roomsRes.json());
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
    return () => window.removeEventListener('resize', handleResize);
  }, [token]);

const handleAddRoom = async () => {
  if (!newRoom.category || !newRoom.price_per_night) return alert("Category & price required!");
  try {
    const formData = new FormData();
    formData.append("category", newRoom.category);
    formData.append("price_per_night", newRoom.price_per_night);
    formData.append("description", newRoom.description);
    if (newRoom.file) formData.append("image", newRoom.file);

    const res = await fetch("http://localhost:5000/admin/rooms", {
      method: "POST",
      headers: { Authorization: token }, // DO NOT set Content-Type, browser will handle it
      body: formData,
    });

    const room = await res.json();
    setRooms([...rooms, room]);
    setNewRoom({ category: "", price_per_night: "", description: "", file: null, image: "" });
    alert("Room added successfully!");
  } catch (err) {
    alert("Failed to add room");
  }
};

const handleEditRoom = async () => {
  if (!editingRoom.category || !editingRoom.price_per_night) return alert("Category & Price required!");
  try {
    const formData = new FormData();
    formData.append("category", editingRoom.category);
    formData.append("price_per_night", editingRoom.price_per_night);
    formData.append("description", editingRoom.description);
    if (editingRoom.file) formData.append("image", editingRoom.file); // optional new file

    const res = await fetch(`http://localhost:5000/admin/rooms/${editingRoom._id}`, {
      method: "PUT",
      headers: { Authorization: token },
      body: formData,
    });

    const updated = await res.json();
    setRooms(rooms.map(r => r._id === updated._id ? updated : r));
    setEditingRoom(null);
    alert("Room updated successfully!");
  } catch (err) {
    alert("Failed to update room");
  }
};


  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`http://localhost:5000/admin/rooms/${id}`, { method: "DELETE", headers: { Authorization: token } });
      setRooms(rooms.filter((r) => r._id !== id));
      alert("Room deleted!");
    } catch (err) { alert("Failed to delete room"); }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === "Completed" ? parseFloat(b.room_id?.price_per_night || 0) : 0), 0);
  const activeGuests = new Set(bookings.map((b) => b.user_id?.email)).size;

  const styles = {
    container: { padding: isMobile ? "20px 10px" : "40px 20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Playfair Display', serif" },
    header: { display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: "30px", borderBottom: "2px solid #d4af37", paddingBottom: "20px", gap: "10px" },
    statsGrid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "40px" },
    statCard: { background: "#0f172a", color: "white", padding: "20px", borderRadius: "15px", textAlign: "center", border: "1px solid #d4af37" },
    formWrapper: { background: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 5px 20px rgba(0,0,0,0.05)", marginBottom: "40px" },
    inputGroup: { display: "flex", flexDirection: isMobile ? "column" : "row", gap: "15px", marginTop: "15px" },
    inputField: { padding: "12px", borderRadius: "8px", border: "1px solid #d4af37", width: "100%", boxSizing: "border-box" },
    imageBox: { width: "100px", height: "100px", border: "2px dashed #d4af37", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "24px", color: "#d4af37", overflow: "hidden" },
    imagePreview: { width: "100%", height: "100%", objectFit: "cover" },
    addButton: { background: "#d4af37", color: "#0f172a", padding: "12px 25px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: isMobile ? "100%" : "auto" },
    tableWrapper: { background: "white", borderRadius: "15px", padding: isMobile ? "15px" : "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", overflowX: "auto", marginBottom: "40px" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: isMobile ? "600px" : "auto" },
    th: { padding: "12px", borderBottom: "2px solid #f1f5f9", color: "#64748b", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" },
    td: { padding: "15px 12px", borderBottom: "1px solid #f1f5f9", color: "#0f172a", fontSize: "13px" },
    statusBadge: (status) => ({ background: status === "Completed" ? "#facc15" : "#e2e8f0", color: status === "Completed" ? "#0f172a" : "#475569", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "11px" }),
  };

  if (loading) return <p style={{ textAlign: "center", padding: "100px", color: "#d4af37" }}>Loading Dashboard...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ color: "#0f172a", margin: 0, fontSize: isMobile ? "24px" : "32px" }}>Admin Dashboard</h1>
        <p style={{ color: "#d4af37", fontWeight: "bold", fontSize: "14px" }}>KINGS HOTEL OFFICIAL</p>
      </div>

      {/* Stats Section */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><p style={{fontSize: "14px", margin: "0 0 10px 0"}}>Total Bookings</p><h2 style={{margin: 0}}>{bookings.length}</h2></div>
        <div style={styles.statCard}><p style={{fontSize: "14px", margin: "0 0 10px 0"}}>Est. Revenue</p><h2 style={{margin: 0}}>${totalRevenue}</h2></div>
        <div style={styles.statCard}><p style={{fontSize: "14px", margin: "0 0 10px 0"}}>Active Guests</p><h2 style={{margin: 0}}>{activeGuests}</h2></div>
      </div>

      {/* Room Management Form */}
      <div style={styles.formWrapper}>
        <h3 style={{margin: 0}}>{editingRoom ? "Edit Room" : "Add New Room"}</h3>
        <div style={styles.inputGroup}>
          <div style={{flex: 1, display: "flex", flexDirection: "column", gap: "10px"}}>
            <select
              style={styles.inputField}
              value={editingRoom ? editingRoom.category : newRoom.category}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, category: e.target.value }) : setNewRoom({ ...newRoom, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              style={styles.inputField}
              type="number"
              placeholder="Price per night"
              value={editingRoom ? editingRoom.price_per_night : newRoom.price_per_night}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, price_per_night: e.target.value }) : setNewRoom({ ...newRoom, price_per_night: e.target.value })}
            />
          </div>
          <div style={{flex: 2}}>
             <textarea
              style={{ ...styles.inputField, height: isMobile ? "80px" : "100%", resize: "none" }}
              placeholder="Room Description"
              value={editingRoom ? editingRoom.description : newRoom.description}
              onChange={(e) => editingRoom ? setEditingRoom({ ...editingRoom, description: e.target.value }) : setNewRoom({ ...newRoom, description: e.target.value })}
            />
          </div>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
            <div style={styles.imageBox} onClick={() => document.getElementById("roomImage").click()}>
              {(editingRoom?.image || newRoom.image) ? (
                <img src={editingRoom?.image || newRoom.image} alt="preview" style={styles.imagePreview} />
              ) : "+"}
            </div>
            <input id="roomImage" type="file" style={{ display: "none" }} onChange={(e) => {
               const imgUrl = URL.createObjectURL(e.target.files[0]);
               editingRoom ? setEditingRoom({ ...editingRoom, image: imgUrl }) : setNewRoom({ ...newRoom, image: imgUrl });
            }} />
          </div>
        </div>
        <div style={{marginTop: "20px", display: "flex", gap: "10px"}}>
          <button style={styles.addButton} onClick={editingRoom ? handleEditRoom : handleAddRoom}>
            {editingRoom ? "Update Room" : "Add Room"}
          </button>
          {editingRoom && <button style={{ ...styles.addButton, background: "#ef4444", color: "white" }} onClick={() => setEditingRoom(null)}>Cancel</button>}
        </div>
      </div>

      {/* Tables Section */}
      <div style={styles.tableWrapper}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Room Inventory</h3>
        <div style={{overflowX: "auto"}}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                {!isMobile && <th style={styles.th}>Description</th>}
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r._id}>
                  <td style={styles.td}>{r.category}</td>
                  <td style={styles.td}>${r.price_per_night}</td>
                  {!isMobile && <td style={styles.td}>{r.description?.substring(0, 30)}...</td>}
                  <td style={styles.td}>
                    {r.image && <img src={r.image} alt="room" style={{ width: "40px", height: "40px", borderRadius: "5px", objectFit: "cover" }} />}
                  </td>
                  <td style={styles.td}>
                    <button style={{ ...styles.editButton, padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer", marginRight: "5px" }} onClick={() => setEditingRoom(r)}>Edit</button>
                    <button style={{ ...styles.deleteButton, padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" }} onClick={() => handleDeleteRoom(r._id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Booking Requests</h3>
        <div style={{overflowX: "auto"}}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Guest</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Dates</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td style={styles.td}>
                    <div style={{fontWeight: "bold"}}>{b.user_id?.name}</div>
                    <div style={{fontSize: "11px", color: "#64748b"}}>{b.user_id?.email}</div>
                  </td>
                  <td style={styles.td}>{b.room_id?.category}</td>
                  <td style={styles.td}>
                    <div style={{fontSize: "11px"}}>{new Date(b.start_time).toLocaleDateString()} - {new Date(b.end_time).toLocaleDateString()}</div>
                  </td>
                  <td style={styles.td}><span style={styles.statusBadge(b.status)}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;