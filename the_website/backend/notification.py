from flask import Flask, request, jsonify
import smtplib
import os

app = Flask(__name__)

# Email config
EMAIL_ADDRESS = os.environ.get("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")

# Assuming you'll replace this with a database
user_data = {
    "user123": {
        "email": "tulgarilhan@gmail.com"
    },
    "user456": {
        "email": "anotheruser@example.com"
    }
}

@app.route('/fallen', methods=['POST'])  # Changed to POST
def fallen():
    data = request.get_json()  # Get JSON data from Arduino
    user_id = data.get('userId')  # Extract user ID
    if user_id:
        user = user_data.get(user_id)  # Replace with database lookup
        if user:
            send_email(user['email'])
            return jsonify({"message": "Fall detected and email sent"}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    else:
        return jsonify({"error": "User ID not provided"}), 400

def send_email(email_address):
    message = "Fall detected for user. Please check on them."

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        subject = "Fall Detected"
        body = message
        msg = f'Subject: {subject}\n\n{body}'
        smtp.sendmail(EMAIL_ADDRESS, email_address, msg)

if __name__ == '__main__':
    app.run(debug=True)