import fastapi
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

# Importation de tous les modèles
# CRUCIAL : SQLAlchemy doit voir ces imports pour créer les tables
from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.cv import CV
from app.models.experience import Experience
from app.models.skill import Skill
from app.models.soft_skill import SoftSkill
from app.models.education import Education
from app.models.language import Language
from app.models.certificate import Certificate
from app.models.club import Club

# Importation des routers
from app.routers import auth

# Initialisation de l'application
app = fastapi.FastAPI(
    title="Talentia - Internship Platform API",
    description="API avec extraction de CV par IA et gestion des stages",
    version="1.0.0"
)

# Middleware CORS (utile si tu as un frontend React/Vue qui appelle l'API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplace par ton domaine frontend en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création automatique des tables dans PostgreSQL
Base.metadata.create_all(bind=engine)

# Inclusion des routes
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "Bienvenue sur l'API Talentia.",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Lancement local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)