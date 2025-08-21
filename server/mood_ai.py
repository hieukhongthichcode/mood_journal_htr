from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
from pymongo import MongoClient

app = Flask(__name__)

# 🔒 Chỉ cho phép domain frontend (Vercel) gọi API
FRONTEND_DOMAIN = "https://mood-journal-htr-git-main-hieutrs-projects.vercel.app"
CORS(app, resources={r"/*": {"origins": FRONTEND_DOMAIN}})

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", FRONTEND_DOMAIN)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

# ---------------------------
# 💡 Health Check
# ---------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "Mood AI API",
        "status": "running",
        "allowed_origin": FRONTEND_DOMAIN,
        "routes": {
            "/": "GET - Health check",
            "/analyze": "POST - Phân tích cảm xúc",
            "/journals": "POST - Tạo bài viết kèm cảm xúc"
        }
    }), 200

# ---------------------------
# 🧠 Hugging Face Config
# ---------------------------
HF_API_TOKEN = os.environ.get("HF_API_TOKEN")
HF_MODEL = "uitnlp/vietnamese-sentiment"
API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"} if HF_API_TOKEN else {}

# ---------------------------
# 🗄 MongoDB Config
# ---------------------------
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client["mood_journal"]

# ---------------------------
# 📚 Keyword Mapping
# ---------------------------
keyword_mapping = {
    # Anger
    "tức": "anger", "giận": "anger", "bực": "anger", "cáu": "anger", "nóng": "anger",
    "điên": "anger", "ức": "anger", "hận": "anger", "chửi": "anger", "gắt": "anger",
    # Sadness
    "buồn": "sadness", "chán": "sadness", "khóc": "sadness", "cô đơn": "sadness",
    "tuyệt vọng": "sadness", "mệt": "sadness", "tổn thương": "sadness", "thất vọng": "sadness",
    "trống rỗng": "sadness", "u sầu": "sadness",
    # Joy
    "vui": "joy", "hạnh phúc": "joy", "yêu": "joy", "thoải mái": "joy", "hài lòng": "joy",
    "thích": "joy", "phấn khởi": "joy", "tươi": "joy", "may mắn": "joy", "cười": "joy",
    # Fear
    "sợ": "fear", "lo": "fear", "run": "fear", "hoảng": "fear", "ám ảnh": "fear",
    "bất an": "fear", "lo lắng": "fear", "rùng mình": "fear", "sợ hãi": "fear", "dè dặt": "fear",
    # Disgust
    "ghê": "disgust", "gớm": "disgust", "khó chịu": "disgust", "bẩn": "disgust",
    "kinh": "disgust", "khinh": "disgust", "ghét": "disgust", "dị ứng": "disgust",
    "chán ghét": "disgust", "phẫn nộ": "disgust",
    # Neutral
    "bình thường": "neutral", "ổn": "neutral", "ok": "neutral", "không sao": "neutral",
    "bình tĩnh": "neutral", "dửng dưng": "neutral", "trung lập": "neutral", "được": "neutral",
    "thường": "neutral", "tạm ổn": "neutral"
}

# ---------------------------
# 🔍 Phân tích cảm xúc bằng từ khóa
# ---------------------------
def analyze_by_keywords(text: str):
    text = text.lower()
    for k, v in keyword_mapping.items():
        if k in text:
            return {"label": v, "original_label": k, "score": 0.95, "method": "keyword"}
    return None

# ---------------------------
# 🤖 Phân tích cảm xúc bằng HuggingFace + mapping
# ---------------------------
def map_hf_to_six(label: str):
    label = label.lower()
    if label == "positive": return "joy"
    elif label == "negative": return "sadness"
    elif label == "neutral": return "neutral"
    return "neutral"

def analyze_by_hgf(text: str):
    try:
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": text}, timeout=15)
        if response.status_code != 200:
            return {"label": "neutral", "score": 0.0, "method": "huggingface", "error": f"HF API error {response.status_code}"}
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            best = max(result, key=lambda x: x.get("score", 0))
            return {"label": map_hf_to_six(best.get("label", "neutral")), "original_label": best.get("label"), "score": best.get("score", 0.0), "method": "huggingface"}
        return {"label": "neutral", "score": 0.0, "method": "huggingface", "error": "Kết quả rỗng"}
    except Exception as e:
        return {"label": "neutral", "score": 0.0, "method": "huggingface", "error": str(e)}

# ---------------------------
# 📝 API phân tích cảm xúc
# ---------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True, silent=True) or {}
    content = data.get("content") or data.get("text")
    user_selected_label = data.get("moodLabel")
    is_update = data.get("isUpdate", False)

    if not content:
        return jsonify({"error": "Thiếu content"}), 400

    if is_update and user_selected_label:
        return jsonify({"label": user_selected_label.lower(), "original_label": user_selected_label, "score": 1.0, "method": "manual"})

    keyword_result = analyze_by_keywords(content)
    if keyword_result: return jsonify(keyword_result)

    result = analyze_by_hgf(content)
    return jsonify(result)

# ---------------------------
# ✍️ API Tạo Journal
# ---------------------------
@app.route("/journals", methods=["POST"])
def create_journal():
    try:
        data = request.get_json(force=True, silent=True) or {}
        title = data.get("title")
        content = data.get("content")
        user_id = data.get("userId")

        if not content:
            return jsonify({"error": "Thiếu content"}), 400

        # 🔍 Phân tích cảm xúc
        keyword_result = analyze_by_keywords(content)
        mood_result = keyword_result if keyword_result else analyze_by_hgf(content)

        # 📦 Lưu MongoDB
        journal = {
            "title": title,
            "content": content,
            "userId": user_id,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "date": datetime.utcnow(),
            "moodLabel": mood_result["label"],
            "moodScore": mood_result["score"]
        }
        inserted = db.journals.insert_one(journal)
        journal["_id"] = str(inserted.inserted_id)

        return jsonify({"message": "Tạo bài viết thành công", "journal": journal}), 201
    except Exception as e:
        return jsonify({"error": f"Lỗi khi tạo journal: {str(e)}"}), 500

# ---------------------------
# 🚀 Run app
# ---------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
