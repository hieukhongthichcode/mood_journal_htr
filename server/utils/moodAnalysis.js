const axios = require('axios');

async function analyzeMood(text) {
  try {
    const response = await axios.post('http://localhost:5001/analyze', { content: text });

    console.log('Kết quả trả về từ Flask:', response.data);

    const mood = response.data;

    if (!mood || typeof mood.label !== 'string') {
      console.error('Dữ liệu trả về không hợp lệ:', mood);
      return { label: 'UNKNOWN', score: 0 };
    }

    const score = parseFloat(mood.score);

    if (isNaN(score)) {
      console.error('Score không hợp lệ:', mood.score);
      return { label: 'UNKNOWN', score: 0 };
    }

    return {
      label: mood.label,
      score: score
    };
  } catch (error) {
    console.error('Lỗi khi gọi Flask:', error.message);
    return { label: 'UNKNOWN', score: 0 };
  }
}
