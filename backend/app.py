from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import base64
import tempfile
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/upload', methods=['POST'])
def handle_image():
    try:
        # Get image data
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_data)
            temp_path = temp_file.name

        # Send to ChatGPT Vision
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this image:"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"file://{temp_path}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )

        # Cleanup
        os.unlink(temp_path)
        
        return jsonify({
            "analysis": response.choices[0].message.content
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)