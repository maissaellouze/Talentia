from fastapi import APIRouter, UploadFile, File, Depends, Query
from sqlalchemy.orm import Session
import shutil
import os
import json
import numpy as np

from app.database import get_db
from app.models.pfe_report import PFEReport
from app.utils.pfe_service import extract_text_from_pdf, generate_embedding

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =========================
# 📤 UPLOAD REPORT
# =========================
@router.post("/upload")
async def upload_report(file: UploadFile = File(...), db: Session = Depends(get_db)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # sauvegarde fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # extraction texte
    text = extract_text_from_pdf(file_path)

    if not text:
        return {"error": "Impossible d'extraire le texte"}

    # embedding
    embedding = generate_embedding(text)

    # ✅ sécurité
    if not embedding:
        return {"error": "Erreur génération embedding"}

    # insertion DB
    report = PFEReport(
        title=file.filename,
        domain="Informatique",   # tu peux changer
        file_url=file_path,
        content_text=text,
        embedding=embedding   # JSON string
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {"message": "Report uploaded", "id": report.id}


# =========================
# 📊 COSINE SIMILARITY
# =========================
def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    # ✅ évite division par zéro
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0

    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


# =========================
# 🔍 SEARCH REPORTS
# =========================
@router.get("/search")
def search_reports(q: str = Query(...), db: Session = Depends(get_db)):

    query_embedding = generate_embedding(q)

    # ✅ sécurité
    if not query_embedding:
        return []

    query_embedding = json.loads(query_embedding)

    reports = db.query(PFEReport).all()

    results = []

    for report in reports:
        if not report.embedding:
            continue

        try:
            emb = json.loads(report.embedding)
        except:
            continue

        score = cosine_similarity(query_embedding, emb)

        results.append({
            "id": report.id,
            "title": report.title,
            "score": float(score)
        })

    # tri par pertinence
    results = sorted(results, key=lambda x: x["score"], reverse=True)

    return results[:5]