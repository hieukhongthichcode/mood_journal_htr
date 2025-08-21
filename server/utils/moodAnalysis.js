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
    const response = await axios.post("https://mood-ai-service.onrender.com/analyze", {
      content: text
    });

    console.log('Kết quả trả về từ Flask:', response.data);

    const mood = response.data;

    if (!mood || typeof mood.label !== 'string') {
      console.error('Dữ liệu trả về không hợp lệ:', mood);
      return { label: 'unknown', score: 0 };
    }

    const score = parseFloat(mood.score);
    if (isNaN(score)) {
      console.error('Score không hợp lệ:', mood.score);
      return { label: 'unknown', score: 0 };
    }

    // Áp dụng mapping
    const mappedLabel = moodMap[mood.label.toLowerCase()] || "unknown";

    return {
      label: mappedLabel,
      score
    };
  } catch (error) {
    console.error('Lỗi khi gọi Flask:', error.message);
    return { label: 'unknown', score: 0 };
  }
}

module.exports = analyzeMood;
