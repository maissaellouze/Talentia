# reste a sauvgarder les donneees dansla base de donnee 
import fitz  # PyMuPDF
import json
import re
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Import pour l'affichage stylé dans la CMD
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()
load_dotenv()

# Configuration du token et du modèle
HF_TOKEN = "your_token"
# Passage à Llama 3.2 ou Zephyr via l'API Chat
#MODEL_ID = "HuggingFaceH4/zephyr-7b-beta" 
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

app = FastAPI(title="Talentia CV Parser")

def extract_text_from_pdf(file_bytes):
    try:
        text = ""
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text
    except Exception as e:
        console.print(f"[bold red]Erreur lecture PDF:[/bold red] {e}")
        return ""

def ask_ai_to_format(raw_text):
    # Formatage spécial pour l'API Chat (Conversational)
    messages = [
        {
            "role": "system", 
            "content": "Tu es un expert RH. Extrais les infos du CV en JSON pur sans aucun texte avant ou après."
        },
        {
            "role": "user", 
            "content": f"Structure ce CV en JSON (nom_complet, email, telephone, competences, experiences): {raw_text}"
        }
    ]
    
    try:
        # On utilise chat_completion car c'est la tâche supportée par le provider
        response = client.chat_completion(
            messages=messages,
            max_tokens=1000,
            temperature=0.1
        )
        
        content = response.choices[0].message.content
        
        # Nettoyage JSON
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"error": "Format JSON non détecté", "raw": content}
    except Exception as e:
        return {"error": f"Erreur API: {str(e)}"}

@app.post("/extract-cv")
async def parse_cv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Fichier PDF requis")

    pdf_bytes = await file.read()
    raw_text = extract_text_from_pdf(pdf_bytes)
    
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="PDF illisible")

    # Analyse IA via l'API de Chat
    data = ask_ai_to_format(raw_text)

    # --- AFFICHAGE DANS LA CMD ---
    console.print("\n" + "="*50, style="bold blue")
    console.print(f"📄 CV ANALYSÉ : [bold yellow]{file.filename}[/bold yellow]")
    
    if "error" in data:
        console.print(Panel(f"[bold red]{data['error']}[/bold red]", title="Erreur IA"))
    else:
        table = Table(title="Données Extraites", show_header=True, header_style="bold magenta")
        table.add_column("Champ")
        table.add_column("Donnée")
        table.add_row("Nom", str(data.get("nom_complet")))
        table.add_row("Email", str(data.get("email")))
        table.add_row("Compétences", ", ".join(data.get("competences", [])))
        console.print(table)
    
    console.print("="*50 + "\n", style="bold blue")
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)