// src/pages/CreateJournal.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateJournal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token'); // Lấy token sau khi login
      const response = await axios.post('http://localhost:5000/api/journals', {
        title,
        content,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      console.log('Đã tạo:', response.data);
      navigate('/dashboard'); // chuyển về trang chính
    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error.response?.data || error.message);
      alert('Tạo bài viết thất bại');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Tạo bài viết mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Tiêu đề</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Nội dung</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gửi bài viết
        </button>
      </form>
    </div>
  );
}

export default CreateJournal;
