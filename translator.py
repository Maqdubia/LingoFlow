
import requests

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil"
}


def translate_text(text, target_code):
    """Translate text using the MyMemory translation API."""

    if not text or not text.strip():
        raise ValueError("Please enter some text.")

    if target_code not in LANGUAGES:
        raise ValueError("Unsupported target language.")

    url = "https://api.mymemory.translated.net/get"

    params = {
        "q": text.strip(),
        "langpair": f"autodetect|{target_code}"
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=20
        )
        response.raise_for_status()

        data = response.json()

        if data.get("responseStatus") != 200:
            raise Exception(
                data.get(
                    "responseDetails",
                    "Translation service error."
                )
            )

        translated_text = data["responseData"]["translatedText"]

        return translated_text

    except requests.exceptions.RequestException as error:
        raise Exception(f"Network error: {error}")


def multilingual_translator():

    print("\n====================================")
    print("       MULTILINGUAL TRANSLATOR")
    print("====================================")

    language_options = {
        "1": ("English", "en"),
        "2": ("Hindi", "hi"),
        "3": ("Telugu", "te"),
        "4": ("Tamil", "ta")
    }

    while True:

        print("\nSelect your target language:")
        print("1. English")
        print("2. Hindi")
        print("3. Telugu")
        print("4. Tamil")
        print("5. Exit")

        choice = input("\nEnter your choice (1-5): ")

        if choice == "5":
            print("\nTranslator closed!")
            break

        if choice not in language_options:
            print("\nInvalid choice. Try again.")
            continue

        language_name, target_code = language_options[choice]

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
