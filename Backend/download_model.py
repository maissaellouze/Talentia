from sentence_transformers import SentenceTransformer
import os
from huggingface_hub import login, snapshot_download

# 1. Login
login(token="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")

# 2. Settings for stability
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

print("--- Starting Model Download ---")

try:
    # This downloads the WHOLE model folder correctly
    model_path = snapshot_download(
        repo_id="sentence-transformers/all-MiniLM-L6-v2",
        local_dir="./model_cache",  # This puts it in a folder called 'model_cache'
        local_dir_use_symlinks=False, # CRITICAL for Windows users
        max_workers=1,
        tqdm_class=None
    )
    print(f"✅ Success! Model saved at: {model_path}")
except Exception as e:
    print(f"❌ Error: {e}")
