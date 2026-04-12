import fastapi
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models.user import User
from app.models.student import Student
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
from app.routers import auth, reports, societe, opportunities
from app.routers import opportunities
# ✅ Import routers
from app.routers.societe import router as societe_router

# Importation des routers
from app.routers import auth
from app.routers import company_dashboard
from app.routers import admin
from app.routers import reports


# ✅ 1. créer app d'abord
app = fastapi.FastAPI(
    title="Talentia - Internship Platform API",
    description="API avec extraction de CV par IA et gestion des stages",
    version="1.0.0"
)

# ✅ 2. middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:3000",
                   "http://localhost:3010",
    "http://localhost:5173","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 3. base de données
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Inclusion des routes
app.include_router(auth.router)

# Include your routes
app.include_router(societe_router)
app.include_router(opportunities.router)
app.include_router(company_dashboard.router)
app.include_router(admin.router)

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.models.application import Application

@app.on_event("startup")
def sync_application_counts():
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

from app.models.pfe_report import PFEReport
from datetime import datetime

@app.on_event("startup")
def seed_initial_reports():
    db = SessionLocal()
    try:
        print("🌱 Checking for missing PFE reports...", flush=True)
        reports_to_seed = [
            { "title": "Système de recommandation d'emploi basé sur le Deep Learning", "domain": "IA", "author": "Ahmed Ben Ali", "year": "2024", "university": "ESPRIT", "views": 342, "description": "Ce projet explore l'utilisation des réseaux de neurones profonds pour personnaliser les recommandations d'offres d'emploi selon le profil du candidat. Le système atteint un taux de pertinence de 87% sur les données de test." },
            { "title": "Plateforme e-commerce avec microservices React & Node.js", "domain": "Web", "author": "Sarra Trabelsi", "year": "2024", "university": "INSAT", "views": 215, "description": "Conception et développement d'une architecture microservices pour une plateforme e-commerce moderne. Chaque service est indépendant, dockerisé et communique via une API Gateway avec gestion de cache Redis." },
            { "title": "Application mobile de suivi médical avec Flutter", "domain": "Mobile", "author": "Mohamed Chaabani", "year": "2023", "university": "FST", "views": 189, "description": "Application cross-platform permettant aux patients de suivre leurs indicateurs de santé (tension, glycémie, poids) et d'envoyer des alertes automatiques à leur médecin en cas d'anomalie détectée." },
            { "title": "Détection d'anomalies réseau par apprentissage automatique", "domain": "IA", "author": "Ines Hamdi", "year": "2023", "university": "ESPRIT", "views": 410, "description": "Système de cybersécurité basé sur des algorithmes de clustering (K-Means, DBSCAN) et de classification (Random Forest) pour détecter en temps réel les intrusions et anomalies dans le trafic réseau." },
            { "title": "Digitalisation des processus RH : ERP sur mesure", "domain": "Web", "author": "Youssef Khelil", "year": "2023", "university": "ISET", "views": 98, "description": "Développement d'un module ERP complet pour la gestion des ressources humaines intégrant : recrutement, paie, congés, évaluations de performances et tableaux de bord analytiques." },
            { "title": "Chatbot intelligent pour le support client bancaire", "domain": "IA", "author": "Rania Meddeb", "year": "2024", "university": "INSAT", "views": 276, "description": "Chatbot NLP basé sur BERT fine-tuné sur des données bancaires tunisiennes. Le système gère les demandes de solde, virements, réclamations et escalade automatiquement vers un agent humain si nécessaire." },
            { "title": "Système de gestion de bibliothèque universitaire", "domain": "Web", "author": "Nour Belhaj", "year": "2022", "university": "FST", "views": 134, "description": "Refonte complète du système de gestion de bibliothèque avec une interface web moderne, gestion des emprunts/retours, notifications automatiques et recherche full-text dans le catalogue en ligne." },
            { "title": "Application IoT pour la gestion d'énergie intelligente", "domain": "IoT", "author": "Bilel Mansouri", "year": "2024", "university": "ENIT", "views": 305, "description": "Réseau de capteurs ESP32 connectés au cloud via MQTT, avec un dashboard temps réel affichant la consommation électrique par pièce et des recommandations d'optimisation générées par IA." },
            { "title": "Plateforme d'apprentissage en ligne avec IA adaptative", "domain": "IA", "author": "Malek Zaidi", "year": "2023", "university": "ESPRIT", "views": 488, "description": "LMS intelligent qui adapte le contenu pédagogique et le rythme d'apprentissage à chaque étudiant grâce à un moteur de recommandation basé sur la théorie de la réponse aux items (IRT) et des modèles de connaissance bayésiens." },
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
            print(f"✅ Successfully seeded {added_count} missing reports.", flush=True)
        else:
            print("ℹ️ All initial reports are already present.", flush=True)
    except Exception as e:
        print(f"❌ Startup seed error: {e}", flush=True)
    finally:
        db.close()

from app.routers import student
app.include_router(student.router)


app.include_router(reports.router)

# route test
@app.get("/")
def root():
    return {
        "message": "Bienvenue sur l'API Talentia.",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
