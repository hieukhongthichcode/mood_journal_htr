const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Đăng ký
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
});

// ✅ Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      token,
      user: {
        _id: user._id, // 🔍 dùng _id để frontend dùng đúng
        name: user.name || user.username,
        email: user.email,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
});

// ✅ Cập nhật profile người dùng (name, avatar)
router.put('/:id', async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, avatar },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name || updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar || null,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật profile' });
  }
});

module.exports = router;
