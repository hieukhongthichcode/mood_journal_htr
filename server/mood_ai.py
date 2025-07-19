# mood_ai.py
from transformers import pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

classifier = pipeline("sentiment-analysis")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    content = data.get("content", "")
    result = classifier(content)[0]
    return jsonify({
    "label": result["label"],
    "score": float(result["score"])
})


if __name__ == "__main__":
    app.run(port=5001)
