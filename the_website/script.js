// script.js
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const synthesis = window.speechSynthesis;
const instructions = document.getElementById('instructions');
const outputDiv = document.getElementById('output');
const startButton = document.getElementById('startButton');

recognition.lang = 'en-US';
recognition.interimResults = false;

const questions = [
    "Please state your full name.",
    "Please state your initials.",
    "Please state your primary contact information.",
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
    let summary = "Here is a summary of the information you provided:\n";
    summary += `Full Name: ${responses[0] || "Not provided"}\n`;
    summary += `Initials: ${responses[1] || "Not provided"}\n`;
    summary += `Primary Contact: ${responses[2] || "Not provided"}\n`;
    summary += `Secondary Contact: ${responses[3] || "Not provided"}\n`;
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
        }
    };
    startRecognition();
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
        } else if(speechResult.toLowerCase().includes("no")) {
            isConfirming = false;
            responses.pop();
            speak(questions[questionIndex]);
            startRecognition();
        } else if (speechResult.toLowerCase().includes("repeat")){
            speak(lastQuestion);
            startRecognition();
        } else if (speechResult.toLowerCase().includes("edit")){
            questionIndex = 0;
            responses = [];
            speak(questions[questionIndex]);
            startRecognition();
        } else {
            speak("please say yes, no, repeat, or edit.");
            startRecognition();
        }
    } else {
        responses.push(speechResult);
        speak(`You said: ${speechResult}. Is that correct?`);
        isConfirming = true;
        recognition.onend = function(){
            startRecognition();
        };
    }
};

recognition.onerror = function(event) {
    speak("An error occurred. Please try again.");
    startRecognition();
};

startButton.addEventListener('click', () => {
    speak(questions[questionIndex]);
    startRecognition();
    startButton.style.display = 'none';
    instructions.style.display = 'none';
});