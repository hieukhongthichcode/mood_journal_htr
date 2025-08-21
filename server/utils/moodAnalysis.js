const axios = require('axios');

// Map nhãn gốc từ Flask/HuggingFace → nhãn chuẩn app dùng
const moodMap = {
  joy: "joy",
  sadness: "sadness",
  anger: "anger",
  fear: "fear",
  disgust: "disgust",
  neutral: "neutral"
};

async function analyzeMood(text) {
  try {
    console.log("📩 Nội dung gửi sang Flask:", text);

    const response = await axios.post("https://mood-ai-service.onrender.com/analyze", {
      content: text
    });

    console.log("🔥 Kết quả trả về từ Flask:", response.data);

    const mood = response.data;

    if (!mood || typeof mood.label !== 'string') {
      console.error("⚠️ Dữ liệu trả về không hợp lệ:", mood);
      return { label: 'unknown', score: 0 };
    }

    const score = parseFloat(mood.score);
    if (isNaN(score)) {
      console.error("⚠️ Score không hợp lệ:", mood.score);
      return { label: 'unknown', score: 0 };
    }

    const mappedLabel = moodMap[mood.label.toLowerCase()] || "unknown";

    console.log("✅ Sau khi mapping:", { label: mappedLabel, score });

    return {
      label: mappedLabel,
      score
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi Flask:", error.message);
    if (error.response) {
      console.error("📥 Flask trả về lỗi:", error.response.data);
    }
    return { label: 'unknown', score: 0 };
  }
}

module.exports = analyzeMood;
