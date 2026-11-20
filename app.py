
from flask import Flask, render_template, request, jsonify
from translator import translate_text, LANGUAGES

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/translate", methods=["POST"])
def translate():

    try:
        data = request.get_json(silent=True) or {}

        text = data.get("text", "").strip()
        target = data.get("target", "")

        if not text:
            return jsonify({
                "error": "Please enter text to translate."
            }), 400

        if len(text) > 5000:
            return jsonify({
                "error": "Text must be 5000 characters or fewer."
            }), 400

        if target not in LANGUAGES:
            return jsonify({
                "error": "Please select a valid target language."
            }), 400

        translated_text = translate_text(text, target)

        return jsonify({
            "translated_text": translated_text,
            "target_language": LANGUAGES[target]
        })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/health")
def health():
    return jsonify({"status": "LingoFlow is running"})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
