
import requests

API_URL = "https://api.mymemory.translated.net/get"

MYMEMORY_EMAIL = "maqdubiarahmath18@gmail.com"

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "ur": "Urdu",
    "ar": "Arabic",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ml": "Malayalam",
    "kn": "Kannada"
}


def translate_text(text, target_code, source_code="autodetect"):
    text = text.strip()

    if not text:
        raise ValueError("Please enter text to translate.")

    if len(text.encode("utf-8")) > 500:
        raise ValueError("Please shorten your text to 500 bytes or less.")

    if target_code not in LANGUAGES:
        raise ValueError("Unsupported target language.")

    params = {
        "q": text,
        "langpair": f"{source_code}|{target_code}",
        "de": MYMEMORY_EMAIL
    }

    try:
        response = requests.get(
            API_URL,
            params=params,
            timeout=20
        )

        response.raise_for_status()
        data = response.json()

        if data.get("responseStatus") != 200:
            error = data.get("responseDetails", "Translation failed.")
            raise Exception(error)

        translated_text = data.get(
            "responseData", {}
        ).get("translatedText", "")

        if not translated_text:
            raise Exception("No translation was returned.")

        return translated_text

    except requests.exceptions.RequestException as error:
        raise Exception(f"Network error: {error}")


def multilingual_translator():
    print("\n===== LingoFlow Translator =====")

    for code, language in LANGUAGES.items():
        print(f"{code}: {language}")

    text = input("\nEnter text: ")
    target = input("Enter target language code: ").lower()

    try:
        result = translate_text(text, target)
        print("\nTranslation:", result)
    except Exception as error:
        print("\nError:", error)


if __name__ == "__main__":
    multilingual_translator()
