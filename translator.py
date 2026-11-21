
import requests

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ar": "Arabic",
    "ja": "Japanese",
    "ko": "Korean",
    "zh-CN": "Chinese",
    "nl": "Dutch"
}

MYMEMORY_EMAIL = "maqdubiarahmath18@gmail.com"


def translate_text(text, target_code):
    """Translate text using the MyMemory translation API."""

    if not text or not text.strip():
        raise ValueError("Please enter some text.")

    if target_code not in LANGUAGES:
        raise ValueError("Unsupported target language.")

    url = "https://api.mymemory.translated.net/get"

    params = {
        "q": text.strip(),
        "langpair": f"autodetect|{target_code}",
        "de": MYMEMORY_EMAIL
    }

    try:
        response = requests.get(url, params=params, timeout=20)

        if response.status_code == 429:
            raise Exception(
                "MyMemory daily translation limit has been reached. "
                "Please wait for the quota to reset and try again."
            )

        response.raise_for_status()
        data = response.json()

        if data.get("responseStatus") != 200:
            raise Exception(
                data.get("responseDetails", "Translation service error.")
            )

        return data["responseData"]["translatedText"]

    except requests.exceptions.RequestException as error:
        raise Exception(f"Network error: {error}")


def multilingual_translator():
    print("\n====================================")
    print("       MULTILINGUAL TRANSLATOR")
    print("====================================")

    language_codes = list(LANGUAGES.items())

    while True:
        print("\nSelect your target language:")

        for index, (code, name) in enumerate(language_codes, start=1):
            print(f"{index}. {name}")

        print(f"{len(language_codes) + 1}. Exit")

        choice = input("\nEnter your choice: ").strip()

        if choice == str(len(language_codes) + 1):
            print("\nTranslator closed!")
            break

        if not choice.isdigit():
            print("\nInvalid choice. Try again.")
            continue

        selected = int(choice) - 1

        if selected < 0 or selected >= len(language_codes):
            print("\nInvalid choice. Try again.")
            continue

        target_code, language_name = language_codes[selected]
        text = input("\nEnter the sentence to translate: ").strip()

        if not text:
            print("Please enter some text.")
            continue

        try:
            translated_text = translate_text(text, target_code)

            print("\n========== TRANSLATION ==========")
            print("Original Text :", text)
            print("Target Language:", language_name)
            print("Translated Text:", translated_text)
            print("=================================")

        except Exception as error:
            print("\nTranslation failed:", error)


if __name__ == "__main__":
    multilingual_translator()
