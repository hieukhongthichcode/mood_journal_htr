const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/posts
router.post("/", authMiddleware, async (req, res) => {
  const { title, content, mood, userId } = req.body;

  if (!title || !content || !mood || !userId) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  try {
    const post = new Post({
      title,
      content,
      mood,
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
