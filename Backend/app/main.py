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
from app.routers.societe import router as societe_router

# Importation des routers
from app.routers import auth

# Initialisation de l'application
app = fastapi.FastAPI(
    title="Talentia - Internship Platform API",
    description="API avec extraction de CV par IA et gestion des stages",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création automatique des tables dans PostgreSQL
#Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Inclusion des routes
app.include_router(auth.router)

# Include your routes
app.include_router(societe_router)

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