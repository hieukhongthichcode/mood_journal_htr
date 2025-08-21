const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const auth = require('../middleware/auth');
const analyzeMood = require('../utils/moodAnalysis');

// ✅ Helper: Chuẩn hoá dữ liệu trả về
const formatJournal = (j) => ({
  _id: j._id,
  title: j.title,
  content: j.content,
  createdAt: j.createdAt,
  updatedAt: j.updatedAt,
  userId: j.userId,
  mood: {
    label: j.moodLabel || "unknown",
    score: j.moodScore ?? 0,
  },
});

// ✅ Tạo mới bài viết
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Không xác định được người dùng' });
    }

    // 🚀 AI phân tích mood
    let moodResult = await analyzeMood(content);
    if (!moodResult || !moodResult.label) {
      moodResult = { label: "unknown", score: 0 };
    }

    const journal = new Journal({
      title,
      content,
      moodLabel: moodResult.label,
      moodScore: moodResult.score,
      userId,
    });

    const savedJournal = await journal.save();
    res.status(201).json(formatJournal(savedJournal));
  } catch (error) {
    console.error('❌ Lỗi khi tạo bài viết:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo bài viết' });
  }
});

// ✅ Lấy danh sách bài viết
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const journals = await Journal.find({ userId }).sort({ createdAt: -1 });
    res.json(journals.map(formatJournal));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết' });
  }
});

// ✅ Lấy dữ liệu moods (Chart)
router.get('/moods', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const journals = await Journal.find({ userId }).sort({ createdAt: 1 });

    const result = journals.map(j => ({
      date: j.createdAt,
      mood: {
        label: j.moodLabel || "unknown",
        score: j.moodScore ?? 0,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Lỗi khi lấy dữ liệu moods:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu moods' });
  }
});

// ✅ Lấy bài viết theo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user?.id || req.user?._id,
    });

    if (!journal) return res.status(404).json({ message: "Bài viết không tồn tại" });
    res.json(formatJournal(journal));
  } catch (error) {
    console.error("❌ Lỗi khi lấy bài viết theo ID:", error);
    res.status(500).json({ message: "Lỗi server khi lấy bài viết" });
  }
});

// ✅ Cập nhật bài viết
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, moodLabel } = req.body;
    const userId = req.user?.id || req.user?._id;

    // Nếu FE không gửi moodLabel, thì BE tự phân tích lại
    let mood = { label: moodLabel || "unknown", score: 1.0 };
    if (!moodLabel) {
      const aiMood = await analyzeMood(content);
      if (aiMood && aiMood.label) mood = aiMood;
      else mood = { label: "unknown", score: 0 };
    }

    const updated = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        title,
        content,
        moodLabel: mood.label,
        moodScore: mood.score,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy bài viết để cập nhật" });
    }

    res.json(formatJournal(updated));
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật bài viết:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
});

// ✅ Xóa bài viết
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
