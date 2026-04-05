import hashlib
import re
import os
import json
import random
import time
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import fitz  # PyMuPDF
from fastapi import APIRouter, Depends, Response, UploadFile, File, Form, HTTPException, status
from groq import Groq
from sqlalchemy.orm import Session, joinedload
from jose import JWTError, jwt
from huggingface_hub import InferenceClient

from app.database import get_db
from app.utils.security import hash_password, verify_password

from app.models.user import User
from app.models.student import Student
from app.models.company import Societe as Company
from app.models.cv import CV
from app.models.skill import Skill
from app.models.soft_skill import SoftSkill
from app.models.experience import Experience
from app.models.education import Education
from app.models.language import Language
from app.models.certificate import Certificate
from app.models.club import Club
from app.models.preference import Preference

from app.schemas.student_schema import StudentRegister
from app.schemas.company_schema import SocieteCreate as CompanyCreate
<<<<<<< Updated upstream
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Registration"])

# ── Configuration IA ──
from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

client = InferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    token=HF_TOKEN
)
=======
from dotenv import load_dotenv
# ── Configuration IA ──

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Initialisation du client Groq
groq_client = Groq(api_key=GROQ_API_KEY)

# Modèle recommandé (Gratuit, Rapide et Puissant)
GROQ_MODEL = "llama-3.3-70b-versatile"
router = APIRouter(prefix="/auth", tags=["Registration"])
>>>>>>> Stashed changes

# ── Config email ──
SMTP_HOST     = "smtp.gmail.com"
SMTP_PORT     = 587
SMTP_EMAIL    = "maissaellouze02@gmail.com"
SMTP_PASSWORD = "hood qlfc ummf vcka"

# Stockage OTP en mémoire { email: { code, expires_at } }
otp_store: dict = {}

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_otp_email(to_email: str, otp: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Votre code de vérification TalentIA"
    msg["From"]    = SMTP_EMAIL
    msg["To"]      = to_email
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#0a0a12;">Vérifiez votre email</h2>
      <p style="color:#6b7280;font-size:14px;">
        Utilisez ce code pour finaliser votre inscription sur <strong>TalentIA</strong> :
      </p>
      <div style="background:#fdfbf0;border:2px solid #e8d88a;border-radius:12px;
                  padding:24px;text-align:center;margin:24px 0;">
        <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#0a0a12;">
          {otp}
        </span>
      </div>
      <p style="color:#6b7280;font-size:12px;">
        Ce code expire dans <strong>10 minutes</strong>.
      </p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

# ════════════════════════════════════════════════
# UTILITAIRES — Nettoyage des données extraites
# ════════════════════════════════════════════════

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def _deduce_from_description(description: str) -> str:
    if not description: return "Développeur Stagiaire"
    d = description.lower()
    if any(k in d for k in ["mobile", "flutter", "android", "ios"]): return "Développeur Mobile"
    if any(k in d for k in ["web", "angular", "react", "php", "django"]): return "Développeur Web"
    if any(k in d for k in ["desktop", "javafx"]): return "Développeur Logiciel"
    if any(k in d for k in ["erp", "dashboard", "reporting", "jasper"]): return "Développeur Full Stack"
    if any(k in d for k in ["api", "backend", "spring", "node"]): return "Développeur Backend"
    if any(k in d for k in ["machine learning", "data", "python"]): return "Développeur Data"
    if "java" in d: return "Développeur Logiciel"
    return "Développeur Stagiaire"

def clean_position(position: str, description: str) -> str:
    if not position: return "Stagiaire"
    p = position.lower().strip()
    if "problem solving" in p or p.startswith("technology"): return _deduce_from_description(description)
    if p in ["internship", "intern", "stagiaire", "stage"]: return "Stagiaire"
    return position.strip()

def clean_company(company: str) -> str:
    if not company or company.strip().lower() in ["", "null", "none", "n/a", "-", "—", "unknown"]: return "Freelance"
    return company.strip()

def clean_date(date_str) -> str | None:
    if not date_str: return None
    d = str(date_str).strip().lower()
    if d in ["present", "présent", "now", "current", "en cours", "aujourd'hui"]: return None
    if re.match(r"^\d{4}-\d{2}-\d{2}$", d): return date_str
    if re.match(r"^\d{4}-\d{2}$", d): return d + "-01"
    if re.match(r"^\d{4}$", d): return d + "-01-01"
    m = re.match(r"^(\d{2})/(\d{4})$", d)
    if m: return f"{m.group(2)}-{m.group(1)}-01"
    return None

def clean_experiences(experiences: list) -> list:
    return [{
        "company": clean_company(e.get("company", "")),
        "position": clean_position(e.get("position", ""), e.get("description", "")),
        "description": e.get("description", ""),
        "start_date": clean_date(e.get("start_date")),
        "end_date": clean_date(e.get("end_date")),
    } for e in experiences if isinstance(e, dict)]
def ask_ai_to_format(raw_text: str) -> dict:
    system_instruction = (
        "Tu es un expert RH. Tu extrais les informations d'un CV. "
        "Réponds UNIQUEMENT par un objet JSON valide, sans texte avant ou après."
    )
    
    # Limiter le texte pour éviter de dépasser les limites de tokens d'entrée
    input_text = raw_text[:4000] 
    
    prompt = f"""
    Extrais les données de ce CV au format JSON suivant :
    {{
      "email": "", "firstName": "", "lastName": "", "phone": "", 
      "university": "", "field_of_study": "", "degree_level": "", 
      "skills": [{{"name": "", "category": "", "level": ""}}],
      "experiences": [{{"company": "", "position": "", "description": "", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD ou null"}}],
      "languages": [{{"name": "", "level": ""}}],
      "soft_skills": [{{"name": "", "level": ""}}]
    }}
    
    CV : {input_text}
    """

    try:
        # Appel à l'API Groq
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL,
            temperature=0.1,
            stream=False,
            response_format={"type": "json_object"} # Force le format JSON
        )

        content = chat_completion.choices[0].message.content.strip()
        data = json.loads(content)
        
        # Nettoyage des expériences avec vos fonctions existantes
        data["experiences"] = clean_experiences(data.get("experiences", []))
        return data

    except Exception as e:
        print(f"Erreur Groq : {str(e)}")
        raise HTTPException(
            status_code=503, 
            detail="Le service d'analyse IA (Groq) est indisponible."
        )

# ════════════════════════════════════════════════
# ROUTES
# ════════════════════════════════════════════════

@router.post("/register/student/manual", status_code=201)
async def register_student_manual(
    password:str=Form(...), email:str=Form(...), first_name:str=Form(""), last_name:str=Form(""),
    phone:str=Form(""), university:str=Form(""), field_of_study:str=Form(""), degree_level:str=Form(""),
    skills:str=Form("[]"), experiences:str=Form("[]"), languages:str=Form("[]"), soft_skills:str=Form("[]"),
    prefs:str=Form("{}"), db:Session=Depends(get_db)
):
    try:
        skills_data = json.loads(skills)
        experiences_data = json.loads(experiences)
        languages_data = json.loads(languages)
        soft_skills_data = json.loads(soft_skills)
        prefs_data = json.loads(prefs)
    except: raise HTTPException(status_code=422, detail="JSON Error")

    if db.query(User).filter(User.email == email).first(): raise HTTPException(status_code=400, detail="Email exists")
    
    otp_code = prefs_data.get("otp_code", "")
    entry = otp_store.get(email)
    if not entry or str(entry["code"]) != str(otp_code).strip(): raise HTTPException(status_code=400, detail="OTP Error")
    otp_store.pop(email, None)

    try:
        user = User(email=email, password=hash_password(password), role="student")
        db.add(user); db.flush()
        student = Student(user_id=user.id, first_name=first_name, last_name=last_name, phone=phone, university=university, field_of_study=field_of_study, degree_level=degree_level)
        db.add(student); db.flush()
        cv = CV(student_id=student.id, title="Profil")
        db.add(cv); db.flush()
        for s in skills_data: db.add(Skill(cv_id=cv.id, name=s.get("name"), category=s.get("category", "Tech"), level=s.get("level", "Intermédiaire")))
        for exp in experiences_data: db.add(Experience(cv_id=cv.id, company_name=clean_company(exp.get("company")), role=exp.get("position"), description=exp.get("description"), start_date=clean_date(exp.get("start_date")), end_date=clean_date(exp.get("end_date"))))
        for lang in languages_data: db.add(Language(cv_id=cv.id, name=lang.get("name"), level=lang.get("level")))
        for ss in soft_skills_data: db.add(SoftSkill(cv_id=cv.id, name=ss.get("name"), level=ss.get("level")))
        db.add(Preference(student_id=student.id, availability=prefs_data.get("availability", "Immédiate"), sectors=",".join(prefs_data.get("sectors", []))))
        db.commit()
        return {"message": "Success", "student_id": student.id}
    except Exception as e:
        db.rollback(); raise HTTPException(status_code=500, detail=str(e))

@router.post("/register/student/auto", status_code=201)
async def register_student_auto(password:str=Form(...), file:UploadFile=File(...), overrides:str=Form("{}"), prefs:str=Form("{}"), db:Session=Depends(get_db)):
    try:
        overrides_data = json.loads(overrides)
        prefs_data = json.loads(prefs)
    except: raise HTTPException(status_code=422, detail="JSON Error")

    pdf_bytes = await file.read()
    data = ask_ai_to_format(extract_text_from_pdf(pdf_bytes))
    
    for k, v in overrides_data.items():
        if v: data[k] = v

    email = data.get("email")
    if not email: raise HTTPException(status_code=400, detail="Email required")
    if db.query(User).filter(User.email == email).first(): raise HTTPException(status_code=400, detail="Email exists")
    
    otp_code = prefs_data.get("otp_code")
    entry = otp_store.get(email)
    if not entry or str(entry["code"]) != str(otp_code).strip(): raise HTTPException(status_code=400, detail="OTP Error")
    otp_store.pop(email, None)

    try:
        user = User(email=email, password=hash_password(password), role="student")
        db.add(user); db.flush()
        student = Student(user_id=user.id, first_name=data.get("firstName"), last_name=data.get("lastName"), university=data.get("university"), field_of_study=data.get("field_of_study"), degree_level=data.get("degree_level"), phone=data.get("phone"))
        db.add(student); db.flush()
        cv = CV(student_id=student.id, title="CV", file_data=pdf_bytes, file_name=file.filename or "cv.pdf")
        db.add(cv); db.flush()
        for s in data.get("skills", []): db.add(Skill(cv_id=cv.id, name=s.get("name"), category=s.get("category", "Tech"), level=s.get("level")))
        for exp in data.get("experiences", []): db.add(Experience(cv_id=cv.id, company_name=clean_company(exp.get("company")), role=exp.get("position"), description=exp.get("description"), start_date=clean_date(exp.get("start_date")), end_date=clean_date(exp.get("end_date"))))
        for lang in data.get("languages", []): db.add(Language(cv_id=cv.id, name=lang.get("name"), level=lang.get("level")))
        for ss in data.get("soft_skills", []): db.add(SoftSkill(cv_id=cv.id, name=ss.get("name"), level=ss.get("level")))
        db.add(Preference(student_id=student.id, availability=prefs_data.get("availability", "Immédiate"), sectors=",".join(prefs_data.get("sectors", []))))
        db.commit()
        return {"status": "success", "email": email}
    except Exception as e:
        db.rollback(); raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    pdf_bytes = await file.read()
    return ask_ai_to_format(extract_text_from_pdf(pdf_bytes))

@router.post("/register/company/request")
def register_company_request(data: CompanyCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Company registration request for email: {data.email}")
    
    # Check Company table
    existing_company = db.query(Company).filter(Company.email == data.email).first()
    if existing_company:
        print(f"DEBUG: Email {data.email} already exists in companies table")
        raise HTTPException(status_code=400, detail="Une demande avec cet email existe déjà dans notre base entreprises.")
    
    # Check User table
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        print(f"DEBUG: Email {data.email} already exists in users table")
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé par un compte utilisateur (Étudiant ou Admin).")

    try:
        company = Company(
            name=data.name, 
            email=data.email, 
            activity=data.industry or data.activity, 
            city=data.city, 
            phone=data.phone, 
            description=data.description, 
            status="pending",
            is_verified=False
        )
        db.add(company)
        db.commit()
        print(f"DEBUG: Company request created successfully for {data.email}")
        return {"message": "Votre demande a été envoyée avec succès."}
    except Exception as e:
        db.rollback()
        print(f"DEBUG: Error creating company request: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la demande: {str(e)}")

@router.post("/send-otp")
async def send_otp(email: str = Form(...)):
    otp = generate_otp()
    otp_store[email] = {"code": otp, "expires_at": time.time() + 600}
    send_otp_email(email, otp)
    return {"message": "OTP sent"}

@router.post("/verify-otp")
async def verify_otp(email: str = Form(...), code: str = Form(...)):
    entry = otp_store.get(email)
    if entry and entry["code"] == code.strip(): return {"verified": True}
    raise HTTPException(status_code=400, detail="Invalid OTP")

# Security
SECRET_KEY = "talentia_secret_key_change_in_production"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440
# pwd_context removed, using app.utils.security

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == username.strip().lower()).first()
    target_user = None
    if user and verify_password(password, user.password): target_user = user
    else:
        company = db.query(Company).filter(Company.email == username.strip().lower()).first()
        if company and company.status == "verified" and verify_password(password, company.password): target_user = company
    if not target_user: raise HTTPException(status_code=401, detail="Incorrect email/password")
    token_data = {"sub": target_user.email, "role": target_user.role, "id": target_user.id}
    if target_user.role == "student":
        s = db.query(Student).filter(Student.user_id == target_user.id).first()
        if s: token_data.update({"student_id": s.id, "name": f"{s.first_name} {s.last_name}"})
    elif target_user.role == "company":
        token_data.update({"company_id": target_user.id, "name": target_user.name})
    resp = {
        "access_token": create_access_token(token_data), 
        "token_type": "bearer", 
        "role": target_user.role,
        "name": token_data.get("name")
    }
    if target_user.role == "company":
        resp["company_id"] = target_user.id
    return resp

@router.get("/cv/{cv_id}/download")
def download_cv(cv_id: int, db: Session = Depends(get_db)):
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv: raise HTTPException(status_code=404)
    return Response(content=cv.file_data, media_type="application/pdf")