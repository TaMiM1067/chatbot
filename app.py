from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json["message"]
    
    # Simple hardcoded bot logic
    if "hello" in user_input.lower():
        response = "Hi! How can I assist you today?"
    elif "your name" in user_input.lower():
        response = "I'm DeepBot, your assistant."
    else:
        response = "Sorry, I didn't understand that."

    return jsonify({"reply": response})

if __name__ == "__main__":
    app.run(debug=True)