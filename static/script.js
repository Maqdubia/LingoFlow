
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");

const translateButton = document.getElementById("translateButton");
const swapButton = document.getElementById("swapButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const micButton = document.getElementById("micButton");


const characterCount = document.getElementById("characterCount");
const outputLanguage = document.getElementById("outputLanguage");
const statusMessage = document.getElementById("statusMessage");

const languageNames = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
    ta: "Tamil"
};

const speechLocales = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN"
};

let recognition = null;
let isListening = false;
let recognitionTimer = null;

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type) {
        statusMessage.classList.add(type);
    }
}

function updateCharacterCount() {
    characterCount.textContent = `${inputText.value.length} / 5000`;
}

function updateOutputLanguage() {
    outputLanguage.textContent =
        languageNames[targetLanguage.value] || "Translation";
}

function resetMicButton() {
    isListening = false;
    micButton.innerHTML = "<span>🎙</span> Speak";

    if (recognitionTimer) {
        clearTimeout(recognitionTimer);
        recognitionTimer = null;
    }
}

inputText.addEventListener("input", updateCharacterCount);
targetLanguage.addEventListener("change", updateOutputLanguage);

clearButton.addEventListener("click", () => {
    inputText.value = "";
    outputText.textContent = "Your translation will appear here...";
    updateCharacterCount();
    showStatus("");
});

swapButton.addEventListener("click", () => {
    const source = sourceLanguage.value;
    const target = targetLanguage.value;

    if (source === "auto") {
        showStatus(
            "Translate first before swapping detected languages.",
            "error"
        );
        return;
    }

    sourceLanguage.value = target;
    targetLanguage.value = source;

    const translated = outputText.textContent;

    if (
        translated !== "Your translation will appear here..." &&
        translated.trim()
    ) {
        inputText.value = translated;
        outputText.textContent = "Your translation will appear here...";
    }

    updateCharacterCount();
    updateOutputLanguage();
    showStatus("Languages swapped.", "success");
});

copyButton.addEventListener("click", async () => {
    const translated = outputText.textContent;

    if (
        !translated ||
        translated === "Your translation will appear here..."
    ) {
        showStatus("There is no translation to copy.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(translated);
        showStatus("Translation copied!", "success");
    } catch (error) {
        showStatus("Unable to copy. Check browser permissions.", "error");
    }
});

translateButton.addEventListener("click", async () => {
    const text = inputText.value.trim();
    const target = targetLanguage.value;

    if (!text) {
        showStatus("Please enter some text first.", "error");
        inputText.focus();
        return;
    }

    if (text.length > 5000) {
        showStatus("Maximum text length is 5000 characters.", "error");
        return;
    }

    translateButton.disabled = true;
    translateButton.textContent = "Translating...";

    showStatus("Translating your text...");

    try {
        const response = await fetch("/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                target: target
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Translation failed.");
        }

        outputText.textContent = data.translated_text;
        updateOutputLanguage();

        showStatus("Translation completed successfully.", "success");

    } catch (error) {
        showStatus(error.message || "Something went wrong.", "error");

    } finally {
        translateButton.disabled = false;
        translateButton.innerHTML = 'Translate <span>→</span>';
    }
});

// SPEECH RECOGNITION

function getSpeechRecognition() {
    return window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        null;
}

function startSpeechRecognition() {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
        showStatus(
            "Voice input is not supported in this browser. Please use Google Chrome.",
            "error"
        );
        return;
    }

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {
        showStatus(
            "Microphone access is unavailable in this browser.",
            "error"
        );
        return;
    }

    if (isListening) {
        if (recognition) {
            recognition.stop();
        }
        return;
    }

    try {
        recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.lang =
            sourceLanguage.value === "auto"
                ? "en-US"
                : speechLocales[sourceLanguage.value] || "en-US";

        let finalTranscript = "";

        recognition.onstart = () => {
            isListening = true;

            if (recognitionTimer) {
                clearTimeout(recognitionTimer);
                recognitionTimer = null;
            }

            micButton.innerHTML = "<span>🎙</span> Listening...";
            showStatus("Listening. Speak now...");
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const currentTranscript =
                (finalTranscript + " " + interimTranscript).trim();

            if (currentTranscript) {
                inputText.value = currentTranscript;
                updateCharacterCount();
            }

            if (finalTranscript.trim()) {
                showStatus("Speech converted to text.", "success");
            }
        };

        recognition.onerror = (event) => {
            const errors = {
                "not-allowed":
                    "Microphone permission denied. Allow microphone access.",
                "service-not-allowed":
                    "The browser speech recognition service is blocked.",
                "no-speech":
                    "No speech detected. Please try speaking again.",
                "network":
                    "Speech recognition network error. Check your internet connection.",
                "audio-capture":
                    "Unable to capture microphone audio. Check your microphone.",
                "aborted":
                    "Voice recognition was stopped.",
                "language-not-supported":
                    "This language is not supported by your browser."
            };

            showStatus(
                errors[event.error] ||
                `Speech recognition error: ${event.error}`,
                "error"
            );

            resetMicButton();
        };

        recognition.onend = () => {
            resetMicButton();

            if (finalTranscript.trim()) {
                inputText.value = finalTranscript.trim();
                updateCharacterCount();
                showStatus("Speech converted to text.", "success");
            }
        };

        showStatus("Starting microphone...");

        // Detect browsers where the recognition service
        // accepts the command but never starts listening.
        recognitionTimer = setTimeout(() => {
            if (!isListening) {
                showStatus(
                    "Your browser did not start voice recognition. Please try Google Chrome.",
                    "error"
                );

                try {
                    recognition.abort();
                } catch (error) {
                    // Recognition may already have stopped.
                }

                resetMicButton();
            }
        }, 8000);

        recognition.start();

    } catch (error) {
        resetMicButton();

        showStatus(
            "Unable to start voice recognition. Please try again in Chrome.",
            "error"
        );
    }
}

micButton.addEventListener("click", startSpeechRecognition);



// INITIALIZE

updateCharacterCount();
updateOutputLanguage();
