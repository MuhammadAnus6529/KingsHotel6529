const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(
    "mongodb+srv://231370129_db_user:Sohaib7890@cluster0.w19wget.mongodb.net/hotel_booking"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const JWT_SECRET = "secret123";

// ======================
// Schemas
// ======================

// User
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  isVerified: { type: Boolean, default: false },
});
const User = mongoose.model("users", userSchema);

// Room
const roomSchema = new mongoose.Schema({
  room_number: String,
  category: String,
  price_per_night: Number,
  description: String,
  image: String,
});
const Room = mongoose.model("rooms", roomSchema);

// Booking
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
const Booking = mongoose.model("bookings", bookingSchema);

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

// Register
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
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
// Room Routes
// ======================

app.get("/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.get("/rooms/:id", async (req, res) => {
  const room = await Room.findById(req.params.id);
  res.json(room);
});

// ======================
// Booking Routes
// ======================

// Create booking (Customer)
app.post("/bookings", authMiddleware, async (req, res) => {
  const { room_id, start_time, end_time } = req.body;
  const userId = req.user.id;

  // Check room conflict
  const roomConflict = await Booking.findOne({
    room_id,
    status: { $in: ["Confirmed", "In-Progress"] },
    start_time: { $lt: end_time },
    end_time: { $gt: start_time },
  });
  if (roomConflict)
    return res.status(400).json({ message: "Room already booked" });

  // Check user conflict
  const userConflict = await Booking.findOne({
    user_id: userId,
    status: { $in: ["Confirmed", "In-Progress"] },
    start_time: { $lt: end_time },
    end_time: { $gt: start_time },
  });
  if (userConflict)
    return res.status(400).json({ message: "You already have a booking" });

  const booking = await Booking.create({
    user_id: userId,
    room_id,
    start_time,
    end_time,
  });

  res.json(booking);
});
// Check Email Route
// Ensure this is in your server file (e.g., app.js)
app.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;  // GET query param
    if (!email) return res.json({ exists: false });

    const user = await User.findOne({ email });
    res.json({ exists: !!user }); // true if user exists
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false });
  }
});

// Customer bookings
app.get("/my-bookings", authMiddleware, async (req, res) => {
  await Booking.updateMany(
    { end_time: { $lt: new Date() }, status: "Confirmed" },
    { status: "Completed" }
  );

  const bookings = await Booking.find({ user_id: req.user.id }).populate("room_id");
  res.json(bookings);
});

// Cancel booking
app.patch("/bookings/:id/cancel", authMiddleware, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (booking.status !== "Confirmed")
    return res.status(400).json({ message: "Cannot cancel" });

  booking.status = "Cancelled";
  await booking.save();
  res.json({ message: "Booking cancelled" });
});

// ======================
// Admin Routes
// ======================

// Add room
app.post("/admin/rooms", authMiddleware, adminMiddleware, async (req, res) => {
  const room = await Room.create(req.body);
  res.json(room);
});

// Update room
app.put("/admin/rooms/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(room);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete room
app.delete("/admin/rooms/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

// View all bookings
app.get("/admin/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  const bookings = await Booking.find()
    .populate("user_id", "name email")
    .populate("room_id", "category price_per_night");
  res.json(bookings);
});

// Approve booking / change status
app.patch("/admin/bookings/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();
    res.json({ message: "Booking status updated", booking });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

// Admin view customers
app.get("/admin/customers", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find({ role: "customer" });
  res.json(users);
});

// ======================
const port = 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
