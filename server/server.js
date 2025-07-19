const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Đặt dotenv trước để các biến môi trường được nạp

const journalsRoute = require('./routes/journals');
const authRoute = require('./routes/auth'); // ✅ Import route

const app = express(); // ✅ Phải có trước khi dùng app.use
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/journals', journalsRoute); // Route cho nhật ký
app.use('/api/auth', authRoute);         // Route cho đăng ký / đăng nhập

app.get("/", (req, res) => {
  res.send("🎉 Mood Journal API is running!");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
