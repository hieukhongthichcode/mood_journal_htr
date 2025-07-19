const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const auth = require('../middleware/auth'); // ✅ Đúng đường dẫn middleware
const analyzeMood = require('../utils/moodAnalysis');

// Tạo mới bài viết
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id || req.user?._id; // ✅ An toàn hơn

    if (!userId) {
      return res.status(401).json({ message: 'Không xác định được người dùng' });
    }

    // Gọi phân tích tâm trạng từ AI
    console.log('Content gửi phân tích:', content);
    const moodResult = await analyzeMood(content); // Trả về { label, score }
    console.log('Kết quả phân tích mood:', moodResult);

    if (!moodResult || !moodResult.label || moodResult.score === undefined) {
      return res.status(500).json({ message: 'Phân tích tâm trạng thất bại' });
    }

    const journal = new Journal({
      title,
      content,
      moodLabel: moodResult.label,
      moodScore: moodResult.score,
      userId: userId
    });

    await journal.save();
    res.status(201).json(journal);
  } catch (error) {
    console.error('Lỗi khi tạo bài viết:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
  }
});

// Lấy danh sách bài viết
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const journals = await Journal.find({ userId }).sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết' });
  }
});

// Xóa bài viết
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    await Journal.deleteOne({ _id: req.params.id, userId });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa bài viết' });
  }
});

module.exports = router;
