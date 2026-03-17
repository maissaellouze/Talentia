import fitz  # PyMuPDF
import json
import re
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# Initialisation
console = Console()
load_dotenv()

# Configuration
HF_TOKEN = os.getenv("HF_TOKEN", "yourToken")
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

app = FastAPI(title="Talentia CV Parser")

def extract_text_from_pdf(file_bytes):
    """Extrait le texte brut du fichier PDF."""
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
    """Envoie le texte à l'IA pour extraction structurée."""
    system_instruction = (
        "Tu es un expert RH. Extrais les infos en JSON STRICT. "
        "IMPORTANT: Trouve la date de naissance. Si elle n'est pas explicite, cherche des mentions comme 'Né le...' "
        "Pour chaque expérience, calcule la durée totale en MOIS (ex: 12 mois). "
        "Référence actuelle pour 'Présent' : Mars 2026."
    )
    
    prompt = f"""Extrais les données en respectant ce format EXACT :
    {{
        "firstName": "Prénom",
        "lastName": "Nom",
        "email": "Email",
        "phone": "Téléphone",
        "dateOfBirth": "DD-MM-YYYY",
        "address": "Adresse",
        "city": "Ville",
        "profilePicture": "Indiquer 'Détectée' ou 'Non détectée'",
        "education": [
            {{
                "university": "Université",
                "degree_level": "Niveau (Licence, Master, ING)",
                "field": "Domaine",
                "year": "Année"
            }}
        ],
        "Langues": ["Langue 1", "Langue 2"],
        "experiences": [
            {{
                "company": "Entreprise",
                "position": "Poste",
                "duration_months": 0
            }}
        ]
    }}
    Texte du CV : {raw_text}"""

    try:
        response = client.chat_completion(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.1
        )
        
        content = response.choices[0].message.content.strip()
        content = content.replace("```json", "").replace("```", "").strip()
        
        # Isolation du bloc JSON
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            return json.loads(content[start_idx:end_idx + 1])
        return {"error": "L'IA n'a pas renvoyé un format JSON valide."}

    except Exception as e:
        return {"error": f"Erreur lors de l'extraction : {str(e)}"}

@app.post("/extract-cv")
async def parse_cv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Fichier PDF requis")

    pdf_bytes = await file.read()
    raw_text = extract_text_from_pdf(pdf_bytes)
    
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="PDF illisible.")

    # Analyse IA
    data = ask_ai_to_format(raw_text)

    # --- AFFICHAGE CONSOLE ---
    console.print("\n" + "="*60, style="bold blue")
    console.print(f"📄 ANALYSE CV : [bold yellow]{file.filename}[/bold yellow]")
    
    if "error" in data:
        console.print(Panel(f"[bold red]{data['error']}[/bold red]"))
    else:
        # Table Personnelle
        t1 = Table(show_header=True, header_style="bold cyan")
        t1.add_column("Champ")
        t1.add_column("Valeur")
        t1.add_row("Nom Complet", f"{data.get('firstName')} {data.get('lastName')}")
        t1.add_row("Date de Naissance", data.get("dateOfBirth", "Non trouvée"))
        t1.add_row("Photo", data.get("profilePicture", "N/A"))
        t1.add_row("Ville", data.get("city", "N/A"))
        t1.add_row("Langues", ", ".join(data.get("Langues", [])))
        console.print(t1)

        # Table Education
        t2 = Table(title="Formation", show_header=True, header_style="bold magenta")
        t2.add_column("Université")
        t2.add_column("Niveau")
        for edu in data.get("education", []):
            t2.add_row(edu.get("university"), edu.get("degree_level"))
        console.print(t2)

        # Table Expérience
        t3 = Table(title="Expériences", show_header=True, header_style="bold green")
        t3.add_column("Poste")
        t3.add_column("Durée")
        for exp in data.get("experiences", []):
            t3.add_row(exp.get("position"), f"{exp.get('duration_months')} mois")
        console.print(t3)

    console.print("="*60 + "\n", style="bold blue")
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)