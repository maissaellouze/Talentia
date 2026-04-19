import hashlib
import os
import re
import json
import random
import time
import smtplib
import fitz  # PyMuPDF
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Response
from sqlalchemy.orm import Session
from jose import JWTError, jwt  # Changement ici : on utilise jwt de jose
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from groq import Groq
from huggingface_hub import InferenceClient

# Importations des modèles et base de données
from app.database import get_db
from app.utils.security import hash_password, verify_password
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.company import Societe as Company
from app.models.ProjectIdea import ProjectIdea
from app.models.cv import CV, Skill, Experience
from app.models.preference import Preference
from app.models.recommendation import RecommendationRequest
from app.schemas.company_schema import SocieteCreate as CompanyCreate

# ─── CONFIGURATION GÉNÉRALE ───
load_dotenv()
router = APIRouter(prefix="/auth", tags=["Authentification & Inscription"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Sécurité JWT
SECRET_KEY = os.getenv("SECRET_KEY", "talentia_secret_key_change_in_production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440

# Configuration IA (Double Provider)
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"

hf_client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)
groq_client = Groq(api_key=GROQ_API_KEY)

# Configuration Email (SMTP)
SMTP_HOST, SMTP_PORT = "smtp.gmail.com", 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "maissaellouze02@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "hood qlfc ummf vcka")

# Stockage OTP temporaire { email: { code, expires_at } }
otp_store: dict = {}

# ─── UTILITAIRES SÉCURITÉ & OTP ───

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Récupère l'utilisateur actuel à partir du token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expirée ou invalide.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Utilise jose.jwt pour décoder
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except JWTError: raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None: raise credentials_exception
    return user

def generate_otp() -> str:
    """Génère un code à 6 chiffres."""
    return str(random.randint(100000, 999999))

def send_otp_email(to_email: str, otp: str):
    """Envoie le code de vérification par email."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Votre code de vérification TalentIA"
    msg["From"], msg["To"] = SMTP_EMAIL, to_email
    html = f"""<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
               <h2 style="color:#2563eb;">TalentIA</h2>
               <p>Votre code de vérification est : <strong style="font-size:24px;">{otp}</strong></p>
               <p>Ce code expire dans 10 minutes.</p></div>"""
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
    except Exception as e:
        print(f"❌ Erreur SMTP: {e}")

# ─── UTILITAIRES ANALYSE DE DONNÉES (IA) ───

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extrait le texte brut d'un fichier PDF."""
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc: text += page.get_text()
    return text

def clean_company(company: str) -> str:
    """Nettoie le nom de l'entreprise."""
    if not company or company.strip().lower() in ["", "null", "none", "n/a", "-", "unknown"]:
        return "Freelance"
    return company.strip()

def clean_date(date_str) -> Optional[str]:
    """Normalise les dates extraites par l'IA."""
    if not date_str: return None
    d = str(date_str).strip().lower()
    if any(x in d for x in ["present", "now", "aujourd'hui", "current", "en cours"]): return None
    if re.match(r"^\d{4}-\d{2}-\d{2}$", d): return date_str
    if re.match(r"^\d{4}-\d{2}$", d): return d + "-01"
    if re.match(r"^\d{4}$", d): return d + "-01-01"
    return d[:10]

def clean_experiences(experiences: list) -> list:
    """Applique le nettoyage sur la liste des expériences."""
    return [{
        "company": clean_company(e.get("company", "")),
        "position": e.get("position", "Stagiaire"),
        "description": e.get("description", ""),
        "start_date": clean_date(e.get("start_date")),
        "end_date": clean_date(e.get("end_date")),
    } for e in experiences if isinstance(e, dict)]

def ask_ai_to_format(raw_text: str) -> dict:
    """Analyse le texte du CV avec Groq ou HuggingFace."""
    system_instruction = "Tu es un expert RH. Réponds UNIQUEMENT par un objet JSON valide."
    prompt = f"Extrais les données de ce CV au format JSON (email, firstName, lastName, phone, university, field_of_study, degree_level, skills, experiences, languages, soft_skills). CV: {raw_text[:4500]}"

    # 1. Tentative avec Groq (Primaire)
    try:
        chat = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}],
            model=GROQ_MODEL, temperature=0.1, response_format={"type": "json_object"}
        )
        data = json.loads(chat.choices[0].message.content)
        data["experiences"] = clean_experiences(data.get("experiences", []))
        return data
    except Exception as e:
        print(f"⚠️ Groq Error: {e}. Essai Fallback Hugging Face...")
        # 2. Fallback avec Hugging Face
        try:
            response = hf_client.chat_completion(
                messages=[{"role": "system", "content": system_instruction}, {"role": "user", "content": prompt}],
                max_tokens=1500, temperature=0.1
            )
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            data = json.loads(content)
            data["experiences"] = clean_experiences(data.get("experiences", []))
            return data
        except Exception as final_err:
            print(f"❌ Final IA Error: {final_err}")
            raise HTTPException(status_code=503, detail="Services IA indisponibles")

# ─── ROUTES AUTHENTIFICATION ───

@router.post("/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    """Gère la connexion pour tous les types d'utilisateurs."""
    user = db.query(User).filter(User.email == username.strip().lower()).first()
    target_user = None
    
    # Vérification Étudiant / Admin / Enseignant
    if user and verify_password(password, user.password):
        target_user = user
    else:
        # Vérification Entreprise (Modèle Societe)
        company = db.query(Company).filter(Company.email == username.strip().lower()).first()
        if company and company.status == "verified" and verify_password(password, company.password):
            target_user = company

    if not target_user:
        raise HTTPException(status_code=401, detail="Identifiants incorrects ou compte non vérifié.")

    role = getattr(target_user, 'role', 'company')
    token_data = {"sub": target_user.email, "role": role, "id": target_user.id}
    
    name = "Utilisateur"
    if role == "student":
        s = db.query(Student).filter(Student.user_id == target_user.id).first()
        if s: name = f"{s.first_name} {s.last_name}"
        token_data["student_id"] = s.id if s else None
    elif role == "company":
        name = target_user.name
        token_data["company_id"] = target_user.id

    # Utilise jose.jwt pour encoder
    access_token = jwt.encode({"exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES), **token_data}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer", "role": role, "name": name}

@router.post("/send-otp")
async def send_otp(email: str = Form(...)):
    """Envoie un code OTP à l'email spécifié."""
    otp = generate_otp()
    otp_store[email] = {"code": otp, "expires_at": time.time() + 600}
    send_otp_email(email, otp)
    return {"message": "OTP envoyé avec succès"}

@router.post("/verify-otp")
async def verify_otp(email: str = Form(...), code: str = Form(...)):
    """Vérifie la validité du code OTP."""
    entry = otp_store.get(email)
    if entry and entry["code"] == code.strip() and entry["expires_at"] > time.time():
        return {"verified": True}
    raise HTTPException(status_code=400, detail="OTP invalide ou expiré")

# ─── ROUTES INSCRIPTION ÉTUDIANT (AUTO) ───

@router.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    """Parse un CV et retourne les données JSON pour prévisualisation."""
    return ask_ai_to_format(extract_text_from_pdf(await file.read()))

@router.post("/register/student/auto", status_code=status.HTTP_201_CREATED)
async def register_student_auto(
    password: str = Form(...),
    file: UploadFile = File(...),
    overrides: str = Form("{}"),
    prefs: str = Form("{}"),
    db: Session = Depends(get_db)
):
    """Finalise l'inscription automatique de l'étudiant à partir du CV."""
    try:
        pdf_bytes = await file.read()
        ai_data = ask_ai_to_format(extract_text_from_pdf(pdf_bytes))
        student_data = {**ai_data, **json.loads(overrides)}
        prefs_data = json.loads(prefs)
        
        email = student_data.get("email", "").strip().lower()
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")
        
        # Création du compte utilisateur
        new_user = User(email=email, password=hash_password(password), role="student")
        db.add(new_user); db.flush()

        # Création du profil étudiant
        new_student = Student(
            user_id=new_user.id,
            first_name=student_data.get("firstName"),
            last_name=student_data.get("lastName"),
            university=student_data.get("university"),
            phone=student_data.get("phone")
        )
        db.add(new_student); db.flush()

        # Sauvegarde du fichier CV en DB
        new_cv = CV(student_id=new_student.id, title=f"CV_{new_student.last_name}", file_data=pdf_bytes, file_name=file.filename)
        db.add(new_cv); db.flush()

        # Enregistrement des expériences professionnelles
        for exp in student_data.get("experiences", []):
            db.add(Experience(
                cv_id=new_cv.id, 
                company_name=clean_company(exp.get("company")),
                role=exp.get("position"), 
                start_date=clean_date(exp.get("start_date")),
                end_date=clean_date(exp.get("end_date")),
                description=exp.get("description", "")
            ))

        db.commit()
        return {"status": "success", "email": email}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ─── ROUTES PROJETS & RECOMMANDATIONS ───

@router.post("/submit-project-idea/")
async def submit_idea(
    title: str = Form(...), 
    description: str = Form(...), 
    teacher_id: int = Form(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Soumet une idée de projet à un enseignant."""
    if current_user.role != "student": 
        raise HTTPException(status_code=403, detail="Réservé aux étudiants.")
    
    student_profile = db.query(Student).filter(Student.user_id == current_user.id).first()
    new_idea = ProjectIdea(
        title=title, 
        description=description, 
        student_id=student_profile.id, 
        teacher_id=teacher_id, 
        status="pending"
    )
    db.add(new_idea); db.commit()
    return {"message": "Projet soumis avec succès"}

@router.get("/my-recommendation-requests")
def get_my_recommendation_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Liste les demandes de recommandation de l'étudiant connecté."""
    student_profile = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student_profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé.")
        
    requests = db.query(RecommendationRequest).filter(RecommendationRequest.student_id == student_profile.id).all()
    return [{
        "id": r.id, 
        "purpose": r.purpose, 
        "status": r.status.lower() if r.status else "pending", 
        "teacher_name": r.teacher.user.email if r.teacher else "Inconnu"
    } for r in requests]