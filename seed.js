const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ======================
// MongoDB Connection
// ======================
mongoose.connect(
  "mongodb+srv://231370129_db_user:Sohaib7890@cluster0.w19wget.mongodb.net/hotel_booking"
);

// ======================
// Schemas (same as app.js)
// ======================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});
const User = mongoose.model("users", userSchema);

const roomSchema = new mongoose.Schema({
  room_number: String,
  category: String,
  price_per_night: Number,
  description: String,
  image: String,
});
const Room = mongoose.model("rooms", roomSchema);

// ======================
// Mock Data
// ======================
const roomCategories = [
  {
    room_number: "STD-1",
    category: "Standard",
    price_per_night: 150,
    description:
      "A refined space featuring a plush Queen bed and artisanal coffee station. Perfect for the business traveler.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2000",
  },
  {
    room_number: "STD-2",
    category: "Standard",
    price_per_night: 180,
    description:
      "The Classic Twin room offers sophisticated comfort with two twin beds and a dedicated workspace.",
    image:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2000",
  },
  {
    room_number: "DLX-1",
    category: "Deluxe",
    price_per_night: 280,
    description:
      "Panoramic city views with a King-sized bed and a complimentary premium mini-bar curated for royalty.",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2000",
  },
  {
    room_number: "DLX-2",
    category: "Deluxe",
    price_per_night: 320,
    description:
      "Garden Terrace Deluxe. Features a private outdoor seating area to enjoy the morning sunrise.",
    image:
      "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=2000",
  },
  {
    room_number: "DLX-3",
    category: "Deluxe",
    price_per_night: 350,
    description:
      "Ocean View Haven. Floor-to-ceiling windows providing an unobstructed view of the horizon.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000",
  },
  {
    room_number: "STE-1",
    category: "Suite",
    price_per_night: 550,
    description:
      "The Executive Suite. Features a private kitchenette, marble balcony, and a walk-in rainfall shower.",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2000",
  },
  {
    room_number: "STE-2",
    category: "Suite",
    price_per_night: 850,
    description:
      "The Presidential Sanctuary. A sprawling three-room suite with a private library and grand piano.",
    image:
      "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=2000",
  },
  {
    room_number: "STE-3",
    category: "Suite",
    price_per_night: 1200,
    description:
      "The Royal Penthouse. The ultimate Kings Hotel experience with 360-degree views and private butler service.",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2000",
  },
];

// ======================
// Seed Function
// ======================
const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database...");

    await Room.deleteMany();
    await User.deleteMany({ role: "admin" });

    await Room.insertMany(roomCategories);

    const hashedPassword = await bcrypt.hash("123", 10);

    await User.create({
      email: "admin@hotel.com",
      password: hashedPassword,
      role: "admin",
    });
    const hashedPassworduser = await bcrypt.hash("123", 10);

 await User.create({
      email: "user@hotel.com",
      password: hashedPassworduser,
      role: "user",
    });

    console.log("✅ Rooms & Admin seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
};

seedDatabase();
