const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// Configuration & DB
// ======================

// Use process.env for security. On Vercel, you will add these in the dashboard.
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://231370129_db_user:Sohaib7890@cluster0.w19wget.mongodb.net/hotel_booking";
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ======================
// Schemas
// ======================

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  isVerified: { type: Boolean, default: false },
});
const User = mongoose.models.users || mongoose.model("users", userSchema);

const roomSchema = new mongoose.Schema({
  room_number: String,
  category: String,
  price_per_night: Number,
  description: String,
  image: String,
});
const Room = mongoose.models.rooms || mongoose.model("rooms", roomSchema);

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "rooms" },
  start_time: Date,
  end_time: Date,
  status: {
    type: String,
    enum: ["Confirmed", "In-Progress", "Cancelled", "Completed", "Waiting"],
    default: "Confirmed",
  },
});
const Booking = mongoose.models.bookings || mongoose.model("bookings", bookingSchema);

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
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
};

// ======================
// Auth Routes
// ======================

app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  res.json({ token, role: user.role });
});

// ======================
// Room & Booking Routes
// ======================

app.get("/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.get("/rooms/:id", async (req, res) => {
  const room = await Room.findById(req.params.id);
  res.json(room);
});

app.post("/bookings", authMiddleware, async (req, res) => {
  const { room_id, start_time, end_time } = req.body;
  const userId = req.user.id;

  const roomConflict = await Booking.findOne({
    room_id,
    status: { $in: ["Confirmed", "In-Progress"] },
    start_time: { $lt: end_time },
    end_time: { $gt: start_time },
  });
  if (roomConflict) return res.status(400).json({ message: "Room already booked" });

  const booking = await Booking.create({
    user_id: userId,
    room_id,
    start_time,
    end_time,
  });
  res.json(booking);
});

app.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ exists: false });
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ exists: false });
  }
});

app.get("/my-bookings", authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user.id }).populate("room_id");
  res.json(bookings);
});

// ======================
// Admin Routes
// ======================

app.post("/admin/rooms", authMiddleware, adminMiddleware, async (req, res) => {
  const room = await Room.create(req.body);
  res.json(room);
});

app.delete("/admin/rooms/:id", authMiddleware, adminMiddleware, async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: "Room deleted" });
});

app.get("/admin/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  const bookings = await Booking.find().populate("user_id", "name email").populate("room_id", "category");
  res.json(bookings);
});

// ======================
// Vercel Deployment Export
// ======================

// Only listen if we are running locally
if (process.env.NODE_ENV !== 'production') {
    const port = 5000;
    app.listen(port, () => console.log(`Local server on http://localhost:${port}`));
}

// THIS IS CRITICAL FOR VERCEL
module.exports = app;