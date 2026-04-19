import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.database import engine, Base, SessionLocal
# Importation de TOUS les modèles pour que SQLAlchemy puisse mapper les relations
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.company import Societe
from app.models.cv import CV
from app.models.experience import Experience
from app.models.skill import Skill
from app.models.soft_skill import SoftSkill
from app.models.education import Education
from app.models.language import Language
from app.models.certificate import Certificate
from app.models.club import Club
from app.models.preference import Preference
from app.models.opportunity import Opportunity, OpportunityRequirement, OpportunityBenefit
from app.models.application import Application
from app.models.pfe_report import PFEReport
from app.models.ProjectIdea import ProjectIdea
from app.models.recommendation import RecommendationRequest

# --- CRUCIAL : Importe le modèle Review ici ---
# Si tu as une erreur "No module named app.models.review", 
# crée le fichier ou commente la relation "Review" dans Societe
try:
    from app.models.review import Review 
except ImportError:
    print("⚠️ Attention: Le modèle Review est introuvable mais référencé dans Societe.")

# Importation des routers
from app.routers import (
    auth, 
    reports, 
    societe, 
    opportunities, 
    company_dashboard, 
    admin, 
    teachers,
    student
)

app = FastAPI(
    title="Talentia - Internship Platform API",
    description="API avec extraction de CV par IA et gestion des stages",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

# Inclusion des routes
# Note: On suppose que les préfixes sont gérés à l'intérieur des fichiers router
app.include_router(auth.router)
app.include_router(societe.router)
app.include_router(opportunities.router)
app.include_router(company_dashboard.router)
app.include_router(admin.router)
app.include_router(student.router)
app.include_router(reports.router)
app.include_router(teachers.router)

# --- ÉVÉNEMENTS DE DÉMARRAGE ---

@app.on_event("startup")
def sync_application_counts():
    """Synchronise le compteur de candidatures pour chaque opportunité"""
    db = SessionLocal()
    try:
        opps = db.query(Opportunity).all()
        for opp in opps:
            count = db.query(Application).filter(Application.opportunity_id == opp.id).count()
            opp.applications_count = count
        db.commit()
        print("✅ Opportunity application counts synchronized.")
    except Exception as e:
        print(f"❌ Startup sync error: {e}")
    finally:
        db.close()

@app.on_event("startup")
def seed_initial_reports():
    """Remplit la base de données avec des rapports PFE de test si vide"""
    db = SessionLocal()
    try:
        print("🌱 Checking for PFE reports...", flush=True)
        reports_to_seed = [
            { "title": "Système de recommandation d'emploi basé sur le Deep Learning", "domain": "IA", "author": "Ahmed Ben Ali", "year": "2024", "university": "ESPRIT", "views": 342, "description": "Exploration des réseaux de neurones profonds pour le recrutement." },
            { "title": "Plateforme e-commerce avec microservices React & Node.js", "domain": "Web", "author": "Sarra Trabelsi", "year": "2024", "university": "INSAT", "views": 215, "description": "Architecture microservices moderne." },
            { "title": "Application mobile de suivi médical avec Flutter", "domain": "Mobile", "author": "Mohamed Chaabani", "year": "2023", "university": "FST", "views": 189, "description": "Suivi santé cross-platform." }
        ]
        
        added_count = 0
        for r in reports_to_seed:
            exists = db.query(PFEReport).filter(PFEReport.title == r["title"]).first()
            if not exists:
                db.add(PFEReport(
                    **r,
                    file_url="/uploads/mock_report.pdf",
                    content_text=r["description"],
                    embedding=None,
                    created_at=datetime.utcnow()
                ))
                added_count += 1
        
        if added_count > 0:
            db.commit()
            print(f"✅ Seeded {added_count} reports.", flush=True)
    except Exception as e:
        print(f"❌ Startup seed error: {e}", flush=True)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API Talentia.", "docs": "/docs"}

if __name__ == "__main__":
    # Utilisation de l'import string pour le reload correct avec uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)