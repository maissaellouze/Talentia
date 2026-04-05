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
    "http://localhost:5173",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 3. base de données
Base.metadata.create_all(bind=engine)

# Inclusion des routes
app.include_router(auth.router)

# Include your routes
app.include_router(societe_router)
app.include_router(opportunities.router)
app.include_router(company_dashboard.router)
app.include_router(admin.router)


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
