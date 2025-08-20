const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Nạp biến môi trường

const journalsRoute = require('./routes/journals');
const authRoute = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware (cập nhật để xử lý ảnh lớn)
app.use(cors({
  origin: "https://mood-journal-htr.vercel.app", // FE domain Vercel
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '5mb' })); // ✅ Cho phép body JSON lớn
app.use(express.urlencoded({ extended: true, limit: '5mb' })); // ✅ Cho form data lớn

// ✅ Routes
app.use('/api/journals', journalsRoute);
app.use('/api/auth', authRoute);

// ✅ Check API server
app.get("/", (req, res) => {
  res.send("🎉 Mood Journal API is running!");
});

// ✅ MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
