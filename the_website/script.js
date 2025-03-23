// script.js
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const synthesis = window.speechSynthesis;
const instructions = document.getElementById('instructions');
const outputDiv = document.getElementById('output');
const startCircle = document.getElementById('startCircle');

recognition.lang = 'en-US';
recognition.interimResults = false;

const questions = [
    "Please state your full name.",
    "Please state your primary contact email address.",
    "Please state your secondary contact information, if any."
];

let responses = [];
let questionIndex = 0;
let isConfirming = false;
let lastQuestion = "";

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    synthesis.speak(utterance);
    lastQuestion = text;
}

function startRecognition() {
    recognition.start();
}

function summarizeAndEdit() {
    let conversations = JSON.parse(localStorage.getItem("conversations")) || []; // Get existing conversations or create empty array
    conversations.push(responses); // Add current responses to conversations
    localStorage.setItem("conversations", JSON.stringify(conversations)); // Update localStorage

    let latestConversation = conversations[conversations.length - 1]; // Get the latest conversation

    let summary = "Here is a summary of your latest conversation:\n";
    summary += `Full Name: ${latestConversation[0] || "Not provided"}\n`;
    summary += `Primary Contact Email: ${latestConversation[1] || "Not provided"}\n`;
    summary += `Secondary Contact: ${latestConversation[2] || "Not provided"}\n`;
    summary += "Would you like to edit any of this information?";
    speak(summary);

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        if (speechResult.toLowerCase().includes("yes")) {
            questionIndex = 0;
            responses = [];
            speak(questions[questionIndex]);
            startRecognition();
        } else {
            speak("Thank you, your information has been recorded.");
            console.log(responses);
            outputDiv.innerHTML = "<p>Data recorded. Check console.</p>";
            sendEmailToBackend();
        }
    };
    startRecognition();
}

function processEmail(spokenEmail) {
    let email = spokenEmail.toLowerCase();
    email = email.replace(/\s+/g, ''); // Remove spaces
    email = email.replace(/\bat\b/g, '@'); // Replace "at" with "@"
    email = email.replace(/\bdot\b/g, '.'); // Replace "dot" with "."
    return email;
}

recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    if (isConfirming) {
        if (speechResult.toLowerCase().includes("yes")) {
            isConfirming = false;
            questionIndex++;
            if (questionIndex < questions.length) {
                speak(questions[questionIndex]);
                startRecognition();
            } else {
                summarizeAndEdit();
            }
        } else if (speechResult.toLowerCase().includes("no")) {
            isConfirming = false;
            responses.pop();
            speak(questions[questionIndex]);
            startRecognition();
        } else if (speechResult.toLowerCase().includes("repeat")) {
            speak(lastQuestion);
            startRecognition();
        } else if (speechResult.toLowerCase().includes("edit")) {
            questionIndex = 0;
            responses = [];
            speak(questions[questionIndex]);
            startRecognition();
        } else {
            speak("Please say yes, no, repeat, or edit.");
            startRecognition();
        }
    } else {
        if (questionIndex === 1) { // If it's the email question
            responses.push(processEmail(speechResult));
        } else {
            responses.push(speechResult);
        }
        speak(`You said: ${responses[responses.length - 1]}. Is that correct?`);
        isConfirming = true;
        recognition.onend = function() {
            startRecognition();
        };
    }
};

recognition.onerror = function(event) {
    speak("An error occurred. Please try again.");
    startRecognition();
};

startCircle.addEventListener('click', () => {
    responses = []; // Clear the responses array for a new conversation
    questionIndex = 0; // Reset question index
    speak(questions[questionIndex]);
    startRecognition();
    startCircle.style.display = 'none';
    instructions.style.display = 'none';
});

const conversations = JSON.parse(localStorage.getItem("conversations")); // Get conversations on page load

if (conversations && conversations.length > 0) {
    responses = conversations[conversations.length - 1]; // Load latest conversation
    alert("Latest conversation restored");
}

function sendEmailToBackend() {
    const primaryEmailAddress = responses[1];
    if (primaryEmailAddress) {
        fetch('http://127.0.0.1:5000/send_user_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: primaryEmailAddress })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Email sent to backend:', data);
            speak("Email sent to backend");
        })
        .catch(error => {
            console.error('Error sending email to backend:', error);
            speak("There was an error sending the email to the backend");
        });
    } else {
        speak("Primary email address not found.");
    }
}
