import React, { useState } from "react";
import axios from "axios";

const CreateJournal = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodLabel, setMoodLabel] = useState("");
  const [moodScore, setMoodScore] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const NODE_URL = process.env.REACT_APP_NODE_URL || "http://localhost:5000";

  const handleAnalyzeMood = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${NODE_URL}/api/mood/analyze`, { text: content });
      setMoodLabel(res.data.label);
      setMoodScore(res.data.score);
    } catch (error) {
      console.error("Lỗi phân tích cảm xúc:", error);
      alert("Không phân tích được cảm xúc!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${NODE_URL}/api/journals`,
        {
          title,
          content,
          mood: moodLabel,       // gửi string
          moodScore: moodScore,  // gửi number
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Tạo nhật ký thành công!");
      console.log(res.data);

      // reset
      setTitle("");
      setContent("");
      setMoodLabel("");
      setMoodScore("");
    } catch (error) {
      console.error("Lỗi tạo nhật ký:", error);
      alert("Không tạo được nhật ký!");
    }
  };

  return (
    <div>
      <h2>Tạo bài viết mới</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Nội dung"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <button type="button" onClick={handleAnalyzeMood} disabled={loading}>
          {loading ? "Đang phân tích..." : "Phân tích cảm xúc"}
        </button>

        {moodLabel && (
          <div>
            <p>Cảm xúc: {moodLabel}</p>
            <p>Độ chính xác: {moodScore}</p>
          </div>
        )}

        <button type="submit">Đăng bài</button>
      </form>
    </div>
  );
};

export default CreateJournal;
