from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator
import requests
import os

app = Flask(__name__)

# ✅ Bật CORS cho tất cả domain
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Thêm header CORS cho chắc chắn (tránh lỗi preflight 404/blocked)
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Mood AI API",
        "status": "running",
        "routes": {
            "/": "GET - Health check",
            "/analyze": "POST - Phân tích cảm xúc (body: {content|text, moodLabel(optional)})"
        }
    }), 200

# Hugging Face model
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/uitnlp/vietnamese-sentiment"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"} if HF_API_TOKEN else {}

# Mapping từ khóa tiếng Việt sang emotion
keyword_mapping = {
    "tức": "anger",
    "giận": "anger",
    "bực": "anger",
    "cáu": "anger",
    "buồn": "sadness",
    "chán": "sadness",
    "khóc": "sadness",
    "vui": "joy",
    "hạnh phúc": "joy",
    "yêu": "joy",
    "sợ": "fear",
    "lo": "fear",
    "run": "fear",
    "ghê": "disgust",
    "gớm": "disgust"
}

# 1. Phân tích bằng từ khóa
def analyze_by_keywords(text: str):
    text = text.lower()
    for k, v in keyword_mapping.items():
        if k in text:
            return {"label": v, "original_label": k, "score": 0.95, "method": "keyword"}
    return None

# 2. Phân tích bằng HuggingFace sentiment model
def analyze_by_hgf(text: str):
    payload = {"inputs": text}
    response = requests.post(API_URL, headers=HEADERS, json=payload)

    if response.status_code != 200:
        raise Exception(f"Hugging Face API error: {response.text}")

    result = response.json()

    if isinstance(result, list) and len(result) > 0:
        best = max(result, key=lambda x: x["score"])
        return {
            "label": best["label"].lower(),
            "original_label": best["label"],
            "score": best["score"],
            "method": "huggingface"
        }
    else:
        raise Exception(f"Kết quả API không hợp lệ: {result}")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    content = data.get("content") or data.get("text")
    user_selected_label = data.get("moodLabel")

    if not content:
        return jsonify({"error": "Thiếu content hoặc text"}), 400

    # Nếu người dùng chọn cảm xúc thủ công
    if user_selected_label:
        return jsonify({
            "label": user_selected_label.lower(),
            "original_label": user_selected_label,
            "score": 1.0,
            "method": "manual"
        })

    # 1. Thử phân tích bằng từ khóa
    keyword_result = analyze_by_keywords(content)
    if keyword_result:
        return jsonify(keyword_result)

    # 2. Nếu không có → gọi HuggingFace
    try:
        result = analyze_by_hgf(content)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "label": "unknown",
            "original_label": None,
            "score": 0.0,
            "method": "error",
            "error": f"Lỗi phân tích cảm xúc: {str(e)}"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
