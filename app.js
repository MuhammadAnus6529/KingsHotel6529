const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// Configuration & DB
// ======================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://231370129_db_user:Sohaib7890@cluster0.w19wget.mongodb.net/hotel_booking";
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ======================
// Schemas
// ======================
const User = mongoose.models.users || mongoose.model("users", new mongoose.Schema({
  name: String, email: { type: String, unique: true, required: true },
  phone: String, password: { type: String, required: true },
  role: { type: String, default: "customer" }, isVerified: { type: Boolean, default: false }
}));

const Room = mongoose.models.rooms || mongoose.model("rooms", new mongoose.Schema({
  room_number: String, category: String, price_per_night: Number, description: String, image: String
}));

const Booking = mongoose.models.bookings || mongoose.model("bookings", new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "rooms" },
  start_time: Date, end_time: Date, 
  status: { type: String, enum: ["Confirmed", "In-Progress", "Cancelled", "Completed", "Waiting"], default: "Confirmed" }
}));

// ======================
// Middleware
// ======================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch { res.status(401).json({ message: "Invalid token" }); }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

// ======================
// Routes
// ======================
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashedPassword });
    res.status(201).json({ message: "User registered", user: { id: user._id, name: user.name } });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  res.json({ token, role: user.role });
});

app.get("/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.get("/rooms/:id", async (req, res) => {
  const room = await Room.findById(req.params.id);
  res.json(room);
});

app.get('/check-email', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  res.json({ exists: !!user });
});

// ==========================================
// STATIC FRONTEND SERVING (Fixed for Crash)
// ==========================================
const frontendPath = path.join(__dirname, "Frontend", "dist");
app.use(express.static(frontendPath));

// FIX: Regex use kiya hai taake Express v5+ mein crash na ho
app.get(/^(?!\/(register|login|rooms|bookings|admin|check-email)).*$/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) res.status(500).send("Frontend build not found.");
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, () => console.log("Local server on 5000"));
}

module.exports = app;