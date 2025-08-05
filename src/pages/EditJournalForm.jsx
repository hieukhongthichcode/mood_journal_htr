import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditJournalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodLabel, setMoodLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/journals/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTitle(res.data.title);
        setContent(res.data.content);
        setMoodLabel(res.data.moodLabel || "");
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error.message);
        setError("Không thể tải bài viết.");
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/journals/${id}`,
        { title, content, moodLabel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Cập nhật thành công!");
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      console.error("Lỗi cập nhật:", error.response?.data || error.message);
      setError("❌ Lỗi khi cập nhật bài viết.");
      setMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Đang tải bài viết...
      </p>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 pt-24 px-4 pb-12">
      <div className="absolute inset-0 opacity-10 bg-[url('/journal-bg.jpg')] bg-cover bg-center blur-sm"></div>

      <div className="relative z-10 max-w-xl mx-auto bg-white dark:bg-slate-800 shadow-2xl rounded-3xl px-6 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          🛠️ Chỉnh Sửa Nhật Ký
        </h2>

        {(message || error) && (
          <div
            className={`mb-4 px-4 py-2 rounded-xl text-sm text-center font-medium ${
              message
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {message || error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung"
            rows={5}
            className="w-full max-h-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <select
            value={moodLabel}
            onChange={(e) => setMoodLabel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Chọn cảm xúc</option>
            <option value="joy">😊 Vui vẻ</option>
            <option value="anger">😠 Tức giận</option>
            <option value="sadness">😢 Buồn</option>
            <option value="fear">😨 Sợ hãi</option>
            <option value="disgust">🤢 Chán ghét</option>
            <option value="neutral">😶 Trung lập</option>
          </select>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition"
          >
            💾 Lưu Thay Đổi
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditJournalForm;
