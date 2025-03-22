import cv2
import numpy as np
import time
from ultralytics import YOLO

# Load a pretrained YOLOv8 model
model = YOLO('yolov8n.pt')  # or yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt

def capture_image():
    """Captures an image from the laptop's camera."""
    cap = cv2.VideoCapture(0)  # 0 indicates the default camera
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return None

    ret, frame = cap.read()
    cap.release()

    if not ret:
        print("Error: Could not capture image.")
        return None

    return frame

def analyze_image(image):
    """Analyzes the image using YOLOv8."""
    if image is None:
        return "No image received"

    results = model(image)  # Predict objects in the image
    detections = results[0].boxes.xyxy.cpu().numpy() # get bounding boxes.
    if len(detections) > 0:
        print("Objects detected!")
        return "Objects detected."
    else:
        print("No objects detected.")
        return "Area appears safe."

def main():
    """Main loop for capturing and analyzing images."""
    while True:
        image = capture_image()
        if image is not None:
            analysis_result = analyze_image(image)
            print(analysis_result)

            # Optional: Display the image with bounding boxes
            results = model(image)
            annotated_frame = results[0].plot() #plot bounding boxes
            cv2.imshow("YOLOv8 Detection", annotated_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        time.sleep(0.1)  # Adjust delay as needed
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()