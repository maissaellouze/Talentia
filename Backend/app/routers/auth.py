import hashlib
from typing import Dict, Any, Optional, List
import re
import os
import json
import random
import time
import smtplib
import requests
import io
import pandas as pd
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import fitz  # PyMuPDF
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, Request, Response, UploadFile, File, Form, HTTPException, status
from groq import Groq
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

# Importations des modèles et base de données
from app.models.recommendation import RecommendationRequest
from app.database import get_db
from app.utils.security import hash_password, verify_password
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.company import Societe as Company
from app.models.ProjectIdea import ProjectIdea
from app.models.cv import CV
from app.models.skill import Skill
from app.models.soft_skill import SoftSkill
from app.models.experience import Experience
from app.models.education import Education
from app.models.language import Language
from app.models.certificate import Certificate
from app.models.club import Club
from app.models.preference import Preference
from app.schemas.company_schema import SocieteCreate as CompanyCreate

# ─── CONFIGURATION ───
load_dotenv()
router = APIRouter(prefix="/auth", tags=["Authentification & Inscription"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "talentia_secret_key_change_in_production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)
GROQ_MODEL = "llama-3.3-70b-versatile"

# Config email
SMTP_HOST, SMTP_PORT = "smtp.gmail.com", 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "maissaellouze02@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "hood qlfc ummf vcka")

otp_store: dict = {}

# ─── UTILITAIRES SÉCURITÉ & OTP ───

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expirée ou invalide.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
    except JWTError: raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None: raise credentials_exception
    return user

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_otp_email(to_email: str, otp: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Votre code TalentIA"
    msg["From"], msg["To"] = SMTP_EMAIL, to_email
    html = f"""<div style="font-family:sans-serif;padding:20px;">
               <h2>Code de vérification : {otp}</h2>
               <p>Ce code expire dans 10 minutes.</p></div>"""
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
    except Exception as e:
        print(f"Erreur envoi email: {e}")

# ─── UTILITAIRES EXTRACTION & IA ───

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc: text += page.get_text()
    return text

def clean_company(c): return c.strip() if (c and str(c).lower() != "null") else "Freelance"

def clean_date(d):
    if not d: return None
    d = str(d).strip().lower()
    if any(x in d for x in ["present", "now", "aujourd'hui"]): return None
    return d[:10]

def clean_int(val: Any) -> Optional[int]:
    if val is None: return None
    try:
        match = re.search(r'\d+', str(val))
        return int(match.group()) if match else None
    except: return None

def clean_list(val: Any) -> List[str]:
    if not val: return []
    if isinstance(val, list): return [str(x) for x in val]
    if isinstance(val, str): return [x.strip() for x in val.split(",") if x.strip()]
    return []

def ask_ai_to_format(raw_text: str) -> dict:
    prompt = f"Extrais les données de ce CV au format JSON (email, firstName, lastName, phone, university, skills, experiences, languages, soft_skills). CV: {raw_text[:4000]}"
    try:
        chat = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": "Tu es un expert RH. Réponds en JSON uniquement."},
                      {"role": "user", "content": prompt}],
            model=GROQ_MODEL, temperature=0.1, response_format={"type": "json_object"}
        )
        return json.loads(chat.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=503, detail="IA indisponible")

# ─── ROUTES AUTHENTIFICATION ───

@router.post("/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == username.strip().lower()).first()
    target_user = None
    
    if user and verify_password(password, user.password):
        target_user = user
    else:
        company = db.query(Company).filter(Company.email == username.strip().lower()).first()
        if company and company.status == "verified" and verify_password(password, company.password):
            target_user = company

    if not target_user:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

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

    access_token = jwt.encode({"exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES), **token_data}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer", "role": role, "name": name}

@router.post("/send-otp")
async def send_otp(email: str = Form(...)):
    otp = generate_otp()
    otp_store[email] = {"code": otp, "expires_at": time.time() + 600}
    send_otp_email(email, otp)
    return {"message": "OTP envoyé"}

@router.post("/verify-otp")
async def verify_otp(email: str = Form(...), code: str = Form(...)):
    entry = otp_store.get(email)
    if entry and entry["code"] == code.strip(): return {"verified": True}
    raise HTTPException(status_code=400, detail="OTP invalide")

# ─── ROUTES INSCRIPTION ÉTUDIANT ───

@router.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    return ask_ai_to_format(extract_text_from_pdf(await file.read()))

@router.post("/register/student/auto", status_code=status.HTTP_201_CREATED)
async def register_student_auto(
    password: str = Form(...),
    file: UploadFile = File(...),
    overrides: str = Form("{}"),
    prefs: str = Form("{}"),
    db: Session = Depends(get_db)
):
    try:
        overrides_data = json.loads(overrides)
        prefs_data = json.loads(prefs)
        pdf_bytes = await file.read()
        ai_data = ask_ai_to_format(extract_text_from_pdf(pdf_bytes))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Erreur de format ou analyse : {str(e)}")
    
    student_data = {**ai_data, **overrides_data}
    email = student_data.get("email", "").strip().lower()
    
    if not email or db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email invalide ou déjà utilisé.")
    
    otp_code = prefs_data.get("otp_code")
    entry = otp_store.get(email)
    if not entry or str(entry["code"]) != str(otp_code).strip():
        raise HTTPException(status_code=400, detail="Code OTP invalide.")
    
    try:
        new_user = User(email=email, password=hash_password(password), role="student")
        db.add(new_user); db.flush()

        new_student = Student(
            user_id=new_user.id,
            first_name=student_data.get("firstName"),
            last_name=student_data.get("lastName"),
            university=student_data.get("university"),
            field_of_study=student_data.get("field_of_study"),
            degree_level=student_data.get("degree_level"),
            phone=student_data.get("phone")
        )
        db.add(new_student); db.flush()

        new_cv = CV(student_id=new_student.id, title=f"CV_{new_student.last_name}", file_data=pdf_bytes, file_name=file.filename)
        db.add(new_cv); db.flush()

        for s in student_data.get("skills", []):
            name = s.get("name") if isinstance(s, dict) else s
            db.add(Skill(cv_id=new_cv.id, name=name, category="Tech"))

        for exp in student_data.get("experiences", []):
            db.add(Experience(
                cv_id=new_cv.id,
                company_name=clean_company(exp.get("company")),
                role=exp.get("position"),
                start_date=clean_date(exp.get("start_date")),
                end_date=clean_date(exp.get("end_date"))
            ))

        db.add(Preference(student_id=new_student.id, availability=prefs_data.get("availability", "Immédiate"), sectors=",".join(prefs_data.get("sectors", []))))
        
        otp_store.pop(email, None)
        db.commit()
        return {"status": "success", "email": email}
    except Exception as e:
        db.rollback(); raise HTTPException(status_code=500, detail=str(e))

# ─── ROUTES ENTREPRISE ───

@router.post("/register/company/request")
def register_company_request(data: CompanyCreate, db: Session = Depends(get_db)):
    if db.query(Company).filter(Company.email == data.email).first():
        raise HTTPException(status_code=400, detail="Une demande existe déjà.")
    
    company_dict = data.model_dump(exclude_unset=True)
    company = Company(**company_dict, status="pending", is_verified=False)
    db.add(company); db.commit()
    return {"message": "Demande envoyée"}

# ─── ROUTES PROJETS ÉTUDIANTS ───

@router.post("/submit-project-idea/", status_code=status.HTTP_201_CREATED)
async def submit_idea_student(
    title: str = Form(...),
    description: str = Form(...),
    teacher_id: int = Form(...),
    technologies: str = Form(None),
    difficulty_level: str = Form("Intermédiaire"),
    file: UploadFile = File(None), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student": raise HTTPException(status_code=403, detail="Réservé aux étudiants.")
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    pdf_data = await file.read() if file else None
    new_idea = ProjectIdea(
        title=title, description=description, technologies=technologies,
        difficulty_level=difficulty_level, specifications_pdf=pdf_data,
        pdf_filename=file.filename if file else None,
        student_id=student.id, teacher_id=teacher_id, status="pending"
    )
    db.add(new_idea); db.commit()
    return {"message": "Projet soumis"}

@router.get("/my-project-ideas")
def get_my_submitted_ideas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    ideas = db.query(ProjectIdea).filter(ProjectIdea.student_id == student.id).all()
    return [{"id": i.id, "title": i.title, "status": i.status, "teacher": i.teacher.user.email} for i in ideas]

@router.get("/my-project-ideas/{idea_id}/download-pdf")
def download_project_pdf(idea_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    idea = db.query(ProjectIdea).filter(ProjectIdea.id == idea_id, ProjectIdea.student_id == student.id).first()
    if not idea or not idea.specifications_pdf: raise HTTPException(status_code=404)
    return Response(content=idea.specifications_pdf, media_type="application/pdf")

# ─── RECOMMANDATIONS & AUTRES ───

@router.post("/request-recommendation")
async def request_recommendation(
    teacher_id: int = Form(...),
    purpose: str = Form(...),
    additional_info: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Sécurité : on cherche le profil Student lié à l'User connecté
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    
    if not student:
        raise HTTPException(
            status_code=404, 
            detail="Profil étudiant non trouvé. Vérifiez votre inscription."
        )

    try:
        new_request = RecommendationRequest(
            student_id=student.id,
            teacher_id=teacher_id,
            purpose=purpose,
            additional_info=additional_info,
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(new_request)
        db.commit()
        return {"status": "success", "message": "Demande de recommandation envoyée avec succès"}
    except Exception as e:
        db.rollback()
        print(f"Erreur DB: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors de l'enregistrement.")
    
@router.get("/available-teachers")
def list_available_teachers(db: Session = Depends(get_db)):
    teachers = db.query(Teacher).all()
    return [{"id": t.id, "email": t.user.email, "name": f"Prof. {t.user.email.split('@')[0]}"} for t in teachers]

@router.get("/my-recommendation-requests")
def get_my_recommendation_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    requests = db.query(RecommendationRequest).filter(RecommendationRequest.student_id == student.id).all()
    
    return [{
        "id": r.id,
        "purpose": r.purpose,
        "status": r.status.lower() if r.status else "pending", # Force les minuscules
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "teacher_name": f"Prof. {r.teacher.user.email.split('@')[0]}" if r.teacher else "Inconnu",
        "content": r.content if hasattr(r, 'content') else None # Assurez-vous que ce champ existe pour voir la lettre
    } for r in requests]