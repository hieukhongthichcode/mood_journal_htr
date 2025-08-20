import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function CreateJournal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState(null);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const NODE_URL = import.meta.env.VITE_BACKEND_URL;
  const FLASK_URL = import.meta.env.VITE_FLASK_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Gọi Flask để phân tích cảm xúc
      const analysisRes = await axios.post(`${FLASK_URL}/analyze`, { content });
      const { label, score } = analysisRes.data; // ✅ giữ nguyên label gốc

      // 2. Gọi NodeJS để lưu journal
      const response = await axios.post(
        `${NODE_URL}/api/journals`,
        {
          title,
          content,
          moodLabel: label,   // ✅ lưu đúng nhãn gốc từ Flask
          moodScore: score,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3. Hiển thị kết quả
      setEmotion({ label, score });
      console.log('✅ Đã tạo journal:', response.data);
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
            <label className="block text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">
              📌 Tiêu đề
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hôm nay trời thế nào trong lòng bạn?"
              required
              className="w-full px-4 py-3 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-inner"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">
              📝 Nội dung
            </label>
            <textarea
              rows="8"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy thả lỏng và viết ra tất cả những gì bạn cảm nhận được..."
              required
              className="w-full px-4 py-3 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-inner resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-300 shadow-md"
          >
            ✨ Gửi Nhật Ký
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
