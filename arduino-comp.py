import socket
import io
import cv2
import numpy as np
from PIL import Image
import time
import base64
import requests
import os

arduino_ip = "YOUR_ARDUINO_IP_ADDRESS"  # IP ADDRESS
port = 8080 #CHECK THE PORT NUMBER
api_key = os.getenv("OPENAI_API_KEY") # Ensure you have your API key set as an environment variable.

def encode_image(image):
    _, buffer = cv2.imencode(".jpg", image)
    return base64.b64encode(buffer).decode('utf-8')

def analyze_image_with_gpt4v(image, prompt):
    base64_image = encode_image(image)

    headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {api_key}"
    }

    payload = {
      "model": "gpt-4-vision-preview",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            },
            {
              "type": "image_url",
              "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
              }
            }
          ]
        }
      ],
      "max_tokens": 150 # Adjust max tokens as needed
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    return response.json()

def receive_image():
    """Receives an image from Arduino via WiFi."""
    # ... (Your existing receive_image() function) ...

def analyze_image(image):
    """Analyzes the image using OpenAI's vision API."""
    if image is None:
        return "No image received"

    prompt = "Describe the objects in this image, and tell me if there is anything that could be dangerous to a blind person."
    try:
        result = analyze_image_with_gpt4v(image, prompt)
        analysis_result = result["choices"][0]["message"]["content"]
        return analysis_result
    except Exception as e:
        print(f"Error using OpenAI API: {e}")
        return "Error analyzing image."

def main():
    """Main loop for receiving and analyzing images."""
    # ... (Your existing main() function) ...

if __name__ == "__main__":
    main()