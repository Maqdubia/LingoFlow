
import requests

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil"
}

# Public LibreTranslate servers.
# If one is unavailable, the next server is tried.
TRANSLATION_SERVERS = [
    "https://translate.argosopentech.com/translate",
    "https://libretranslate.de/translate",
    "https://trans.zillyhuhn.com/translate"
]


def translate_text(text, target_code, source_code="auto"):
    text = text.strip()

    if not text:
        raise ValueError("Please enter text to translate.")

    if len(text) > 5000:
        raise ValueError("Text cannot exceed 5000 characters.")

    if target_code not in LANGUAGES:
        raise ValueError("Unsupported target language.")

    if source_code == "autodetect":
        source_code = "auto"

    if source_code != "auto" and source_code not in LANGUAGES:
        raise ValueError("Unsupported source language.")

    payload = {
        "q": text,
        "source": source_code,
        "target": target_code,
        "format": "text"
    }

    errors = []

    for server in TRANSLATION_SERVERS:
        try:
            response = requests.post(
                server,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=25
            )

            response.raise_for_status()
            data = response.json()

            translated_text = data.get("translatedText")

            if translated_text:
                return translated_text

            errors.append(f"{server}: Empty translation response")

        except requests.exceptions.RequestException as error:
            errors.append(f"{server}: {error}")

        except (ValueError, KeyError) as error:
            errors.append(f"{server}: Invalid response: {error}")

    raise Exception(
        "All translation servers are currently unavailable. "
        "Please try again later. Details: " + " | ".join(errors)
    )


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
