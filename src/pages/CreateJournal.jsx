import React, { useState } from "react";
import axios from "axios";

function CreateJournal() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Hàm chuẩn hóa nhãn từ Flask
  function normalizeLabel(label) {
    if (!label) return "NEUTRAL";
    switch (label.toLowerCase()) {
      case "joy":
        return "POSITIVE";
      case "sadness":
      case "anger":
      case "fear":
      case "disgust":
        return "NEGATIVE";
      default:
        return "NEUTRAL";
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    try {
      // 🟡 Gửi content sang Flask để phân tích
      const flaskRes = await axios.post(
        `${import.meta.env.VITE_FLASK_URL}/analyze`,
        { content },
        { headers: { "Content-Type": "application/json" } }
      );

      const { label, score } = flaskRes.data;
      const normalizedLabel = normalizeLabel(label);

      // 🟢 Gửi dữ liệu sang Node backend để lưu vào MongoDB
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/journals`,
        {
          title,
          content,
          moodLabel: normalizedLabel,
          moodScore: score,
        },
        { withCredentials: true }
      );

      alert("📝 Nhật ký đã được lưu thành công!");
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("❌ Lỗi khi tạo journal:", err);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Viết nhật ký mới
      </h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề..."
        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Hãy viết cảm xúc của bạn..."
        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white h-32"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Đang lưu..." : "Lưu nhật ký"}
      </button>
    </form>
  );
}

export default CreateJournal;
