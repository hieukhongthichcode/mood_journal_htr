from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)

# 🔒 Domain frontend được phép gọi API
FRONTEND_DOMAINS = [
    "https://mood-journal-htr.vercel.app",  # production
    "https://mood-journal-htr-git-main-hieutrs-projects.vercel.app",  # preview
    "http://localhost:5173"  # local dev
]
CORS(app, resources={r"/*": {"origins": FRONTEND_DOMAIN}})

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
            "/analyze": "POST - Phân tích cảm xúc (body: {content|text, moodLabel(optional), isUpdate(optional)})"
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
# 📚 Keyword Mapping (VN)
# ---------------------------
keyword_mapping = {
    # Anger
    "tức": "anger", "giận": "anger", "bực": "anger", "cáu": "anger", "nóng": "anger",
    "điên": "anger", "ức": "anger", "hận": "anger", "chửi": "anger", "gắt": "anger",

    # Sadness
    "buồn": "sadness", "chán": "sadness", "khóc": "sadness", "cô đơn": "sadness",
    "tuyệt vọng": "sadness", "mệt": "sadness", "tổn thương": "sadness",
    "thất vọng": "sadness", "trống rỗng": "sadness", "u sầu": "sadness",

    # Joy
    "vui": "joy", "hạnh phúc": "joy", "yêu": "joy", "thoải mái": "joy",
    "hài lòng": "joy", "thích": "joy", "phấn khởi": "joy", "tươi": "joy",
    "may mắn": "joy", "cười": "joy",

    # Fear
    "sợ": "fear", "lo": "fear", "run": "fear", "hoảng": "fear", "ám ảnh": "fear",
    "bất an": "fear", "lo lắng": "fear", "rùng mình": "fear", "sợ hãi": "fear", "dè dặt": "fear",

    # Disgust
    "ghê": "disgust", "gớm": "disgust", "khó chịu": "disgust", "bẩn": "disgust",
    "kinh": "disgust", "khinh": "disgust", "ghét": "disgust", "dị ứng": "disgust",
    "chán ghét": "disgust", "phẫn nộ": "disgust",

    # Neutral
    "bình thường": "neutral", "ổn": "neutral", "ok": "neutral", "không sao": "neutral",
    "bình tĩnh": "neutral", "dửng dưng": "neutral", "trung lập": "neutral",
    "được": "neutral", "thường": "neutral", "tạm ổn": "neutral"
}

# ---------------------------
# 🔍 Phân tích bằng từ khóa
# ---------------------------
def analyze_by_keywords(text: str):
    text = text.lower()
    for k, v in keyword_mapping.items():
        if k in text:
            return {
                "label": v,
                "score": 0.95,
                "method": "keyword"
            }
    return None

# ---------------------------
# 🤖 HuggingFace + mapping
# ---------------------------
def map_hf_to_six(label: str):
    """Map nhãn HF -> 6 loại"""
    label = label.lower()
    if label == "positive":
        return "joy"
    elif label == "negative":
        return "sadness"
    elif label == "neutral":
        return "neutral"
    return "neutral"

def analyze_by_hgf(text: str):
    try:
        payload = {"inputs": text}
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=15)

        if response.status_code != 200:
            return {"label": "neutral", "score": 0.0, "method": "huggingface"}

        result = response.json()

        # Xử lý kết quả nested [[{label, score}]]
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
            result = result[0]

        if isinstance(result, list) and len(result) > 0:
            best = max(result, key=lambda x: x.get("score", 0))
            mapped = map_hf_to_six(best.get("label", "neutral"))
            return {
                "label": mapped,
                "score": best.get("score", 0.0),
                "method": "huggingface"
            }

        return {"label": "neutral", "score": 0.0, "method": "huggingface"}
    except Exception:
        return {"label": "neutral", "score": 0.0, "method": "huggingface"}

# ---------------------------
# 📝 API
# ---------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json(force=True, silent=True) or {}
        content = data.get("content") or data.get("text")
        user_selected_label = data.get("moodLabel")
        is_update = data.get("isUpdate", False)

        if not content:
            return jsonify({"error": "Thiếu content hoặc text"}), 400

        # Nếu user update + chọn tay → ưu tiên
        if is_update and user_selected_label:
            return jsonify({
                "label": user_selected_label.lower(),
                "score": 1.0,
                "method": "manual"
            })

        # Check từ khóa trước
        keyword_result = analyze_by_keywords(content)
        if keyword_result:
            return jsonify(keyword_result)

        # Nếu không có keyword → gọi HuggingFace
        hf_result = analyze_by_hgf(content)
        return jsonify(hf_result)

    except Exception as e:
        return jsonify({
            "label": "neutral",
            "score": 0.0,
            "method": "error",
            "error": str(e)
        }), 500

# ---------------------------
# 🚀 Run
# ---------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
