from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

# Tải mô hình cảm xúc
classifier = pipeline(
    "text-classification", 
    model="bhadresh-savani/bert-base-go-emotion", 
    top_k=1
)

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

# API phân tích cảm xúc
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    content = data.get('content')
    user_selected_label = data.get('moodLabel')  # người dùng có chọn cảm xúc thủ công không?

    if not content:
        return jsonify({'error': 'Thiếu content'}), 400

    # Nếu người dùng đã chọn cảm xúc thủ công → trả về luôn
    if user_selected_label:
        return jsonify({
            'label': user_selected_label.lower(),
            'score': 1.0  # Ưu tiên cảm xúc người dùng chọn
        })

    # Nếu không có → tiến hành phân tích AI
    try:
        translated = GoogleTranslator(source='auto', target='en').translate(content)
    except Exception as e:
        return jsonify({'error': f'Lỗi dịch: {str(e)}'}), 500

    try:
        result = classifier(translated)[0][0]
        label = result['label'].lower()
        score = result['score']
        mapped_label = map_emotion(label)
    except Exception as e:
        return jsonify({'error': f'Lỗi phân tích cảm xúc: {str(e)}'}), 500

    return jsonify({
        'label': mapped_label,
        'score': score
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
