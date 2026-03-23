from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer('paraphrase-MiniLM-L3-v2')


def clean_text(text: str):
    if not text:
        return ""

    text = text.replace("\x00", "")  # supprime NUL
    text = text.encode("utf-8", "ignore").decode("utf-8")

    return text.strip()


def extract_text_from_pdf(path: str):
    reader = PdfReader(path)
    text = ""

    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content

    return clean_text(text)  # ✅ IMPORTANT


def generate_embedding(text: str):
    if not text:
        return None

    try:
        embedding = model.encode([text])[0]  # ✅ FIX
        return json.dumps(embedding.tolist())  # ✅ JSON string
    except Exception as e:
        print("EMBEDDING ERROR:", e)
        return None