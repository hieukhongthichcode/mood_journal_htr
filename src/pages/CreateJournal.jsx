import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function CreateJournal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState(null);
  const navigate = useNavigate();
  const { token, addJournal } = useContext(AuthContext);

  const NODE_URL = import.meta.env.VITE_BACKEND_URL;
  const FLASK_URL = import.meta.env.VITE_FLASK_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Gọi Flask để phân tích cảm xúc
      const analysisRes = await axios.post(`${FLASK_URL}/analyze`, { content });
      const { label, score } = analysisRes.data;

      // 2️⃣ Gọi NodeJS để lưu journal (gửi đúng schema BE cần)
      const response = await axios.post(
        `${NODE_URL}/api/journals`,
        {
          title,
          content,
          mood: label,       // 👈 string
          moodScore: score,  // 👈 number
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Đã tạo journal:', response.data);

      // 3️⃣ Cập nhật chart với dữ liệu chuẩn
      if (addJournal) {
        const newJournal = {
          ...response.data,
          mood: response.data.mood || label,
          moodScore: response.data.moodScore || score,
        };
        addJournal(newJournal);
      }

      // 4️⃣ Hiển thị phân tích cảm xúc
      setEmotion({ label, score });

    } catch (error) {
      console.error('❌ Lỗi khi tạo bài viết:', error.response?.data || error.message);
      alert('Tạo bài viết thất bại, kiểm tra log!');
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-slate-900 py-12 px-4 mt-6">
      <div className="max-w-3xl mx-auto bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-repeat rounded-3xl shadow-2xl p-10 border-l-[6px] border-yellow-400 dark:border-yellow-600">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-800 dark:text-yellow-300">
          📖 Sổ Nhật Ký Cảm Xúc
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-yellow-900 dark:text-yellow-100">
              Tiêu đề ✨
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-md focus:ring-2 focus:ring-yellow-400 p-3 text-lg dark:bg-slate-800 dark:text-white"
              placeholder="Hôm nay của bạn như thế nào?"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-yellow-900 dark:text-yellow-100">
              Nội dung 📝
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="6"
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-md focus:ring-2 focus:ring-yellow-400 p-3 text-lg dark:bg-slate-800 dark:text-white"
              placeholder="Hãy viết nhật ký của bạn ở đây..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
          >
            ✍️ Lưu Nhật Ký
          </button>
        </form>

        {emotion && (
          <div className="mt-10 bg-yellow-100 dark:bg-slate-700 border-l-4 border-yellow-400 dark:border-yellow-500 p-5 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
              🧠 Phân Tích Cảm Xúc:
            </h3>
            <p className="text-gray-800 dark:text-gray-100">
              <strong>Cảm xúc:</strong> {emotion.label}
            </p>
            <p className="text-gray-800 dark:text-gray-100">
              <strong>Mức độ chắc chắn:</strong> {(emotion.score * 100).toFixed(2)}%
            </p>

            <button
              onClick={() => navigate('/home', { state: { reload: true } })}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              📊 Xem biểu đồ cảm xúc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateJournal;
