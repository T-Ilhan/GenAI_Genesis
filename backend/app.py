from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import base64
import tempfile
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Add root route
@app.route('/')
def home():
    return "Backend Server Running"

# Add favicon handler
@app.route('/favicon.ico')
def favicon():
    return '', 204

def analyze_image(image_path, question_type):
    prompt = ""
    if question_type == "danger":
        prompt = "Check if this image contains any potential dangers for someone using a cane. Respond only with 'Yes' or 'No'."
    elif question_type == "scene":
        prompt = "Describe the scenery in this image in one sentence."
    else:
        return "Invalid question type"

    response = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"file://{os.path.abspath(image_path)}"  # Fixed path
                        }
                    }
                ]
            }
        ],
        max_tokens=100
    )
    
    if question_type == "danger":
        answer = response.choices[0].message.content.strip().lower()
        return "Yes" if "yes" in answer else "No"
    
    return response.choices[0].message.content

@app.route('/analyze', methods=['POST'])
def handle_analysis():
    try:
        data = request.json
        if not data or 'image' not in data or 'question_type' not in data:
            return jsonify({"error": "Missing parameters"}), 400
        
        question_type = data['question_type']
        if question_type not in ['danger', 'scene']:
            return jsonify({"error": "Invalid question type"}), 400

        image_data = base64.b64decode(data['image'])
        with tempfile.NamedTemporaryFile(delete=True, suffix=".jpg") as temp_file:
            temp_file.write(image_data)
            temp_file.flush()
            
            result = analyze_image(temp_file.name, question_type)
            
        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)