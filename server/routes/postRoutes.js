const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");
const analyzeMood = require("../utils/analyzeMood"); // ⬅️ import hàm phân tích cảm xúc

// POST /api/posts
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id; // ⬅️ lấy từ middleware xác thực

  if (!title || !content) {
    return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung" });
  }

  try {
    const moodResult = await analyzeMood(content); // ⬅️ gọi phân tích cảm xúc

    const post = new Post({
      title,
      content,
      mood: moodResult.label,        // ví dụ: "joy"
      moodScore: moodResult.score,   // ví dụ: 0.94
      userId,
    });

    await post.save();

    res.status(201).json(post);
  } catch (err) {
    console.error("Lỗi tạo bài viết:", err);
    res.status(500).json({ message: "Lỗi server khi tạo bài viết" });
  }
});

module.exports = router;
