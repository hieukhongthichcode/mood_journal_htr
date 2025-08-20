from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

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
# 📚 Keyword Mapping
# ---------------------------
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


# ---------------------------
# 🔍 Phân tích cảm xúc bằng từ khóa
# ---------------------------
def analyze_by_keywords(text: str):
    text = text.lower()
    for k, v in keyword_mapping.items():
        if k in text:
            return {
                "label": v,
                "original_label": k,
                "score": 0.95,
                "method": "keyword"
            }
    return None


# ---------------------------
# 🤖 Phân tích cảm xúc bằng HuggingFace
# ---------------------------
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


# ---------------------------
# 📝 API phân tích cảm xúc (tạo/sửa bài viết)
# ---------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json() or {}
    content = data.get("content") or data.get("text")
    user_selected_label = data.get("moodLabel")
    is_update = data.get("isUpdate", False)  # ⚡ phân biệt create/update

    if not content:
        return jsonify({"error": "Thiếu content hoặc text"}), 400

    # 🟡 Nếu là update và có chọn cảm xúc thủ công → giữ nguyên, không phân tích
    if is_update and user_selected_label:
        return jsonify({
            "label": user_selected_label.lower(),
            "original_label": user_selected_label,
            "score": 1.0,
            "method": "manual"
        })

    # 🔍 Nếu không có mood thủ công → phân tích
    keyword_result = analyze_by_keywords(content)
    if keyword_result:
        return jsonify(keyword_result)

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


# ---------------------------
# 🚀 Run app
# ---------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
