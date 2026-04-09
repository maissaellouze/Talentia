from fastapi import APIRouter, UploadFile, File, Depends, Query, Form
from sqlalchemy.orm import Session
import shutil
import os
import json
import numpy as np
from datetime import datetime

from app.database import get_db
from app.models.pfe_report import PFEReport
from app.utils.pfe_service import extract_text_from_pdf, generate_embedding

router = APIRouter(prefix="/reports", tags=["Reports"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# 📤 UPLOAD REPORT
# =========================
@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    title: str = Form(None),
    domain: str = Form("Informatique"),
    author: str = Form(None),
    university: str = Form(None),
    year: str = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db)
):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # sauvegarde fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # extraction texte
        text = extract_text_from_pdf(file_path)

        # embedding
        embedding = generate_embedding(text) if text else None

        report = PFEReport(
            title=title if title else file.filename,
            domain=domain,
            author=author,
            university=university,
            year=year,
            description=description,
            file_url=f"/uploads/{file.filename}",
            content_text=text,
            embedding=embedding,
            created_at=datetime.utcnow()
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        return {"message": "Report uploaded", "id": report.id}
    except Exception as e:
        print(f"❌ Upload Error: {e}")
        return {"error": str(e)}


@router.patch("/{report_id}/view")
def increment_view(report_id: int, db: Session = Depends(get_db)):
    report = db.query(PFEReport).filter(PFEReport.id == report_id).first()
    if report:
        report.views += 1
        db.commit()
    return {"views": report.views if report else 0}


# =========================
# 📊 COSINE SIMILARITY
# =========================
def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0

    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# =========================
# 🔍 SEARCH INTELLIGENTE
# =========================
@router.get("/search")
def search_reports(q: str = Query(...), db: Session = Depends(get_db)):

    query_embedding = generate_embedding(q)

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
            "domain": report.domain,
            "created_at": report.created_at,
            "score": score
        })

    results = sorted(results, key=lambda x: x["score"], reverse=True)

    return results[:10]


# =========================
# 📄 LISTE AVEC FILTRES (FRONTEND)
# =========================
@router.get("/")
def get_reports(
    search: str = "",
    domain: str = "",
    sort: str = "date",
    db: Session = Depends(get_db)
):
    query = db.query(PFEReport)

    if search:
        query = query.filter(PFEReport.title.ilike(f"%{search}%"))

    if domain:
        query = query.filter(PFEReport.domain == domain)

    if sort == "date":
        query = query.order_by(PFEReport.created_at.desc())
    elif sort == "old":
        query = query.order_by(PFEReport.created_at.asc())

    reports = query.all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "domain": r.domain,
            "author": r.author,
            "university": r.university,
            "year": r.year,
            "description": r.description,
            "views": r.views,
            "created_at": r.created_at
        }
        for r in reports
    ]