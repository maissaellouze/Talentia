from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
import json
import os

# 1. Get the path to your model_cache folder
# This finds 'backend/model_cache' no matter where you run the script from
current_file_path = os.path.abspath(__file__) # backend/app/utils/pfe_service.py
utils_dir = os.path.dirname(current_file_path) # backend/app/utils
app_dir = os.path.dirname(utils_dir) # backend/app
backend_dir = os.path.dirname(app_dir) # backend
model_path = os.path.join(backend_dir, "model_cache")

# 2. FORCE LOCAL LOADING
# By passing the FOLDER PATH directly, SentenceTransformer skips the internet check.
try:
    model = SentenceTransformer(model_path)
    print(f"✅ SUCCESS: Loaded model locally from {model_path}")
except Exception as e:
    print(f"❌ Could not load from folder: {e}")
    # Fallback to name if the folder is missing a file
    #model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=model_path)
    model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder='./models_fix')

def clean_text(text: str):
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = text.encode("utf-8", "ignore").decode("utf-8")
    return text.strip()

def extract_text_from_pdf(path: str):
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content
    return clean_text(text)

def generate_embedding(text: str):
    if not text:
        return None
    try:
        # Some models require a single string, some a list. 
        # This keeps your original fix intact.
        embedding = model.encode([text])[0]
        return json.dumps(embedding.tolist())
    except Exception as e:
        print("EMBEDDING ERROR:", e)
        return None