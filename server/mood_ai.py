from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator
import requests
import os

app = Flask(__name__)
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://mood-journal-htr-git-main-hieutrs-projects.vercel.app"}})



# Lấy token Hugging Face từ biến môi trường
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-go-emotion"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}

# Bản đồ ánh xạ nhiều cảm xúc chi tiết về các nhóm chính
emotion_map = {
    'joy': ['joy', 'amusement', 'excitement', 'gratitude', 'love', 'relief', 'pride', 'optimism'],
    'anger': ['anger', 'annoyance', 'disapproval'],
    'sadness': ['sadness', 'disappointment', 'grief', 'embarrassment'],
    'fear': ['fear', 'nervousness', 'remorse'],
    'disgust': ['disgust', 'confusion'],
    'neutral': ['neutral', 'realization', 'curiosity', 'desire', 'surprise']
}

# Hàm ánh xạ nhãn chi tiết về nhóm chính
def map_emotion(label):
    for key, values in emotion_map.items():
        if label in values:
            return key
    return 'neutral'

# Hàm gọi Hugging Face Inference API
def analyze_emotion(text):
    payload = {"inputs": text}
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    if response.status_code != 200:
        raise Exception(f"Hugging Face API error: {response.text}")
    
    result = response.json()
    # Kết quả thường có dạng: [[{"label":"anger","score":0.89}, {"label":"joy","score":0.01}, ...]]
    if isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
        candidates = result[0]
        # lấy nhãn có score cao nhất
        best = max(candidates, key=lambda x: x["score"])
        return best
    else:
        raise Exception(f"Kết quả API không hợp lệ: {result}")

# API phân tích cảm xúc
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    content = data.get('content')
    user_selected_label = data.get('moodLabel')

    if not content:
        return jsonify({'error': 'Thiếu content'}), 400

    # Nếu người dùng đã chọn cảm xúc thủ công → trả về luôn
    if user_selected_label:
        return jsonify({
            'label': user_selected_label.lower(),
            'score': 1.0
        })

    # Nếu không có → tiến hành phân tích AI
    try:
        translated = GoogleTranslator(source='auto', target='en').translate(content)
    except Exception as e:
        return jsonify({'error': f'Lỗi dịch: {str(e)}'}), 500

    try:
        result = analyze_emotion(translated)
        label = result['label'].lower()
        score = result['score']
        mapped_label = map_emotion(label)
    except Exception as e:
        return jsonify({'error': f'Lỗi phân tích cảm xúc: {str(e)}'}), 500

    return jsonify({
        'label': mapped_label,
        'original_label': label,
        'score': score,
        'translated_text': translated
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=False)
