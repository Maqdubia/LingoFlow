
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");

const translateButton = document.getElementById("translateButton");
const swapButton = document.getElementById("swapButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const micButton = document.getElementById("micButton");
const listenButton = document.getElementById("listenButton");

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


function initializeSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showStatus(
            "Speech recognition is not supported in this browser. Try Chrome.",
            "error"
        );
        return false;
    }

    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang =
        sourceLanguage.value === "auto"
            ? "en-US"
            : speechLocales[sourceLanguage.value];

    recognition.onstart = () => {
        isListening = true;
        micButton.textContent = "Listening...";
        showStatus("Listening. Speak now...");
    };

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;

        inputText.value = spokenText;
        updateCharacterCount();

        showStatus("Speech converted to text.", "success");
    };

    recognition.onerror = (event) => {
        showStatus(
            `Microphone error: ${event.error}. Check microphone permissions.`,
            "error"
        );
    };

    recognition.onend = () => {
        isListening = false;
        micButton.innerHTML = "<span>🎙</span> Speak";
    };

    return true;
}


micButton.addEventListener("click", () => {
    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    if (!initializeSpeechRecognition()) {
        return;
    }

    try {
        recognition.start();
    } catch (error) {
        showStatus("Unable to start microphone. Try again.", "error");
    }
});


listenButton.addEventListener("click", () => {
    const translated = outputText.textContent.trim();

    if (
        !translated ||
        translated === "Your translation will appear here..."
    ) {
        showStatus("Translate something before listening.", "error");
        return;
    }

    if (!("speechSynthesis" in window)) {
        showStatus("Audio playback is not supported by this browser.", "error");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(translated);

    utterance.lang = speechLocales[targetLanguage.value] || "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
        showStatus("Playing translated audio...");
    };

    utterance.onend = () => {
        showStatus("Audio playback completed.", "success");
    };

    utterance.onerror = () => {
        showStatus("Unable to play translated audio.", "error");
    };

    window.speechSynthesis.speak(utterance);
});


updateCharacterCount();
updateOutputLanguage();
