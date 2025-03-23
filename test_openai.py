import base64
import requests
import os
import cv2

api_key = os.getenv("OPENAI_API_KEY")

def encode_image(image):
    """Encodes an OpenCV image to base64."""
    _, buffer = cv2.imencode(".jpg", image)
    return base64.b64encode(buffer).decode('utf-8')

def analyze_image_with_gpt4v(image, prompt):
    """Sends an image and prompt to the OpenAI Vision API."""
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
        "max_tokens": 300
    }

    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error during API request: {e}")
        return None
    except KeyError as e:
        print(f"Error parsing API response: {e}")
        return None

def main():
    """Tests the OpenAI Vision API with live camera input."""
    cap = cv2.VideoCapture(1)  # 0 indicates the default camera.

    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    prompt = "Describe the objects in this image, and tell me if there is anything that could be dangerous to a blind person."

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Error: Could not capture frame.")
            break

        result = analyze_image_with_gpt4v(frame, prompt)

        if result:
            try:
                print(result["choices"][0]["message"]["content"])
            except KeyError:
                print("Error: Could not access message content from response.")
        else:
            print("API request failed.")

        if cv2.waitKey(1) & 0xFF == ord('q'): #press q to quit.
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()