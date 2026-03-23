import hashlib
import re
import os
import json
import random
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import fitz  # PyMuPDF
from fastapi import APIRouter, Depends, Response, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
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

# ── Configuration IA ──
HF_TOKEN = "your token "
MODEL_ID  = "Qwen/Qwen2.5-7B-Instruct"
client    = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

router = APIRouter(prefix="/auth", tags=["Registration"])

# ── Config email ──
SMTP_HOST     = "smtp.gmail.com"
SMTP_PORT     = 587
SMTP_EMAIL    = "maissaellouze02@gmail.com"    # ← remplace par ton email Gmail
SMTP_PASSWORD = "hood qlfc ummf vcka"       # ← remplace par ton App Password Gmail

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
    """Déduit le poste depuis la description du projet."""
    if not description:
        return "Développeur Stagiaire"
    d = description.lower()
    if "mobile" in d or "flutter" in d or "android" in d or "ios" in d:
        return "Développeur Mobile"
    if "web" in d or "angular" in d or "react" in d or "php" in d or "django" in d:
        return "Développeur Web"
    if "desktop" in d or "javafx" in d:
        return "Développeur Logiciel"
    if "erp" in d or "dashboard" in d or "reporting" in d or "jasper" in d:
        return "Développeur Full Stack"
    if "api" in d or "backend" in d or "spring" in d or "node" in d:
        return "Développeur Backend"
    if "machine learning" in d or "data" in d or "python" in d:
        return "Développeur Data"
    if "java" in d:
        return "Développeur Logiciel"
    return "Développeur Stagiaire"


def clean_position(position: str, description: str) -> str:
    """Déduit un poste propre depuis un titre mal extrait."""
    if not position:
        return "Stagiaire"
    p = position.lower().strip()
    if "problem solving" in p:
        return _deduce_from_description(description)
    if p.startswith("technology:") or p.startswith("technologies:"):
        return _deduce_from_description(description)
    if p in ["internship", "intern", "stagiaire", "stage"]:
        return "Stagiaire"
    return position.strip()


def clean_company(company: str) -> str:
    """Nettoie le nom de la société."""
    if not company or company.strip() == "":
        return "Freelance"
    c = company.strip()
    bad_values = ["null", "none", "n/a", "-", "—", "non spécifié", "unknown"]
    if c.lower() in bad_values:
        return "Freelance"
    return c


def clean_date(date_str) -> str | None:
    """Normalise une date en YYYY-MM-DD."""
    if not date_str:
        return None
    d = str(date_str).strip().lower()
    if d in ["present", "présent", "now", "current", "en cours", "aujourd'hui", "null", "none"]:
        return None
    if re.match(r"^\d{4}-\d{2}-\d{2}$", d):
        return date_str
    if re.match(r"^\d{4}-\d{2}$", d):
        return d + "-01"
    if re.match(r"^\d{4}$", d):
        return d + "-01-01"
    m = re.match(r"^(\d{2})/(\d{4})$", d)
    if m:
        return f"{m.group(2)}-{m.group(1)}-01"
    months = {
        "january": "01", "february": "02", "march": "03", "april": "04",
        "may": "05", "june": "06", "july": "07", "august": "08",
        "september": "09", "october": "10", "november": "11", "december": "12",
        "jan": "01", "feb": "02", "mar": "03", "apr": "04",
        "jun": "06", "jul": "07", "aug": "08", "sep": "09",
        "oct": "10", "nov": "11", "dec": "12",
        "janvier": "01", "février": "02", "mars": "03", "avril": "04",
        "mai": "05", "juin": "06", "juillet": "07", "août": "08",
        "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12",
    }
    for month_name, month_num in months.items():
        pattern = rf"{month_name}\s+(\d{{4}})"
        m = re.search(pattern, d)
        if m:
            return f"{m.group(1)}-{month_num}-01"
    return None


def clean_experiences(experiences: list) -> list:
    """Nettoie et valide toutes les expériences."""
    cleaned = []
    for exp in experiences:
        if not isinstance(exp, dict):
            continue
        cleaned.append({
            "company":     clean_company(exp.get("company", "")),
            "position":    clean_position(exp.get("position", ""), exp.get("description", "")),
            "description": exp.get("description", ""),
            "start_date":  clean_date(exp.get("start_date")),
            "end_date":    clean_date(exp.get("end_date")),
        })
    return cleaned


def ask_ai_to_format(raw_text: str) -> dict:
    system_instruction = (
        "Tu es un expert RH spécialisé dans l'extraction de CV. "
        "Tu dois extraire TOUTES les expériences professionnelles EXACTEMENT comme elles apparaissent. "
        "Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication. "
        "Date actuelle : Mars 2026."
    )

    prompt = f"""Extrais les données du CV ci-dessous en JSON STRICT.

═══ RÈGLES EXPÉRIENCES (TRÈS IMPORTANT) ═══
- Extrais TOUTES les expériences : stages, CDI, CDD, alternance, freelance, internship.
- Types reconnus : stage, emploi salarié, mission freelance, travail indépendant.
- "company" : nom EXACT de l'entreprise dans le CV. Si absent ou travail indépendant → "Freelance".
- "position" : intitulé EXACT du poste. Si "Internship" seul → "Stagiaire".
- "start_date" / "end_date" : format "YYYY-MM-DD". Si en cours → null.
- EXCLURE uniquement : clubs, sport, compétitions, hackathons, projets scolaires non rémunérés.
- Le tableau experiences doit contenir TOUTES les expériences, ne pas en omettre une seule.

═══ RÈGLES DATES ═══
- Convertis TOUJOURS en "YYYY-MM-DD" :
    "Jan 2023" → "2023-01-01", "March 2022" → "2022-03-01", "2021" → "2021-01-01"
- Si end_date = "Present" / "Now" / "En cours" / "Présent" → null
- Si end_date est une vraie date passée → la convertir, NE PAS mettre null

═══ RÈGLES DEGREE LEVEL ═══
- "Software Engineering" / "Engineering degree" / "Ingénieur" → "Ingénierie"
- "Master of Science" / "MSc" / "Master" → "Master"
- "Bachelor" / "BSc" / "Bachelor of IT" / "Licence" → "Licence"
- "PhD" / "Doctorat" → "Doctorat"
- NE PAS mettre "Master 2" si le CV dit "Engineering"

═══ RÈGLES SKILLS ═══
- "skills" = hard skills : langages, frameworks, outils + Problem Solving (category: "Analytique")
- "soft_skills" = comportementales uniquement : leadership, communication, travail en équipe
- Problem Solving → TOUJOURS dans "skills", JAMAIS dans experiences comme position

FORMAT JSON EXACT :
{{
    "email": "...", "firstName": "...", "lastName": "...",
    "phone": "...", "city": "...", "address": "...",
    "university": "...", "field_of_study": "...", "degree_level": "...",
    "skills": [{{"name": "...", "category": "Tech", "level": "Intermédiaire"}}],
    "education": [{{"institution": "...", "degree": "...", "field_of_study": "...",
                   "start_year": 2020, "end_year": 2024, "grade": "...", "description": ""}}],
    "experiences": [{{"company": "...", "position": "...", "description": "...",
                     "start_date": "2023-01-01", "end_date": "2024-06-01"}}],
    "languages": [{{"name": "...", "level": "..."}}],
    "soft_skills": [{{"name": "...", "level": "..."}}]
}}

═══ CV À ANALYSER ═══
{raw_text}"""

    response = client.chat_completion(
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ],
        max_tokens=2500,
        temperature=0.1,
    )

    content = response.choices[0].message.content.strip()
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=422,
            detail=f"L'IA a retourné un JSON invalide. Réessaie. ({e})",
        )

    # ── Post-traitement Python ──
    data["experiences"] = clean_experiences(data.get("experiences", []))

    field  = (data.get("field_of_study") or "").lower()
    degree = (data.get("degree_level")   or "").lower()
    if "engineering" in field or "ingénierie" in field:
        data["degree_level"] = "Ingénierie"
    elif "bachelor" in degree or "licence" in degree:
        data["degree_level"] = "Licence"

    return data


# ════════════════════════════════════════════════
# 1. Register Student (Manuel — Form + JSON)
# ════════════════════════════════════════════════
@router.post("/register/student/manual", status_code=201)
async def register_student_manual(
    password:    str = Form(...),
    email:       str = Form(...),
    first_name:  str = Form(default=""),
    last_name:   str = Form(default=""),
    phone:       str = Form(default=""),
    city:        str = Form(default=""),
    address:     str = Form(default=""),
    university:  str = Form(default=""),
    field_of_study: str = Form(default=""),
    degree_level:   str = Form(default=""),
    skills:      str = Form(default="[]"),       # JSON list
    experiences: str = Form(default="[]"),       # JSON list
    languages:   str = Form(default="[]"),       # JSON list
    soft_skills: str = Form(default="[]"),       # JSON list
    prefs:       str = Form(default="{}"),       # JSON
    db: Session = Depends(get_db),
):
    # 1. Parser les JSON envoyés par le formulaire
    try:
        skills_data      = json.loads(skills)
        experiences_data = json.loads(experiences)
        languages_data   = json.loads(languages)
        soft_skills_data = json.loads(soft_skills)
        prefs_data       = json.loads(prefs)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Données JSON mal formées.")

    # 2. Vérification Email
    if not email:
        raise HTTPException(status_code=422, detail="Email requis.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail=f"L'email '{email}' est déjà enregistré.")

    # 3. Vérifier l'OTP (Correction UnboundLocalError)
    otp_code = prefs_data.get("otp_code", "")
    entry = otp_store.get(email)
    
    if not entry:
        raise HTTPException(status_code=400, detail="Aucun code OTP généré pour cet email.")
    if time.time() > entry["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="Code OTP expiré.")
    if str(entry["code"]) != str(otp_code).strip():
        raise HTTPException(status_code=400, detail="Code OTP incorrect.")
    
    # Consommer l'OTP
    otp_store.pop(email, None)

    try:
        # 4. Création User
        user = User(email=email, password=hash_password(password), role="student")
        db.add(user)
        db.flush()

        # 5. Création Student
        student = Student(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name,
            university=university,
            field_of_study=field_of_study,
            degree_level=degree_level,
            phone=phone,
        )
        db.add(student)
        db.flush()

        # 6. Création CV vide (pour attacher skills/exp)
        cv = CV(student_id=student.id, title="Profil TalentIA")
        db.add(cv)
        db.flush()

        # 7. Ajout des listes
        for s in skills_data:
            db.add(Skill(cv_id=cv.id, name=s.get("name"), category=s.get("category", "Tech"), level=s.get("level", "Intermédiaire")))

        for exp in experiences_data:
            db.add(Experience(
                cv_id=cv.id,
                company_name=clean_company(exp.get("company")),
                role=exp.get("position"),
                description=exp.get("description"),
                start_date=clean_date(exp.get("start_date")),
                end_date=clean_date(exp.get("end_date")),
            ))

        for lang in languages_data:
            db.add(Language(cv_id=cv.id, name=lang.get("name"), level=lang.get("level")))

        for ss in soft_skills_data:
            db.add(SoftSkill(cv_id=cv.id, name=ss.get("name"), level=ss.get("level")))

        # 8. Préférences
        preference = Preference(
            student_id   = student.id,
            availability = prefs_data.get("availability", "Immédiate"),
            sectors      = ",".join(prefs_data.get("sectors", [])),
            notif_offres = prefs_data.get("notifs", {}).get("offres", True),
            notif_hebdo  = prefs_data.get("notifs", {}).get("hebdo",  True),
            notif_recrut = prefs_data.get("notifs", {}).get("recrut", True),
        )
        db.add(preference)

        db.commit()
        return {"message": "Inscription réussie", "student_id": student.id}

    except Exception as e:
        db.rollback()
        print(f"ERROR: {str(e)}") # Log pour debug console
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")


# ════════════════════════════════════════════════
# 3. Register Student Auto (via IA + corrections)
# ════════════════════════════════════════════════
@router.post("/register/student/auto", status_code=201)
async def register_student_auto(
    password:  str        = Form(...),
    file:      UploadFile = File(...),
    overrides: str        = Form(default="{}"),  
    prefs:     str        = Form(default="{}"),  
    db:        Session    = Depends(get_db),
):
    # 1. Parsing JSON inputs from Frontend
    try:
        user_overrides = json.loads(overrides)
        prefs_data     = json.loads(prefs)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Format JSON incorrect dans overrides ou prefs.")

    # 2. PDF Extraction & IA Analysis
    pdf_bytes = await file.read()
    raw_text  = extract_text_from_pdf(pdf_bytes)
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Le contenu du PDF est vide ou illisible.")

    try:
        data = ask_ai_to_format(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Échec de l'analyse IA : {str(e)}")

    # 3. Apply User Overrides (Manual corrections from React UI)
    fields_to_override = ["firstName", "lastName", "email", "phone", "university", "field_of_study", "degree_level"]
    for field in fields_to_override:
        if field in user_overrides and user_overrides[field]:
            data[field] = user_overrides[field]

    # Replace lists if the user edited them in the frontend tables
    for list_field in ["skills", "experiences", "languages", "soft_skills"]:
        if list_field in user_overrides and isinstance(user_overrides[list_field], list):
            data[list_field] = user_overrides[list_field]

    # 4. Email & OTP Verification
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="L'email est requis (non détecté dans le CV).")
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    otp_code = prefs_data.get("otp_code")
    entry = otp_store.get(email)
    
    if not entry:
        raise HTTPException(status_code=400, detail="Veuillez d'abord demander un code OTP.")
    if str(entry["code"]) != str(otp_code).strip():
        raise HTTPException(status_code=400, detail="Le code OTP est invalide.")
    
    otp_store.pop(email, None) # OTP used, remove it

    try:
        # 5. Database Insertion: USER
        # Using hash_password(password) which uses SHA-256 + Bcrypt
        user = User(email=email, password=hash_password(password), role="student")
        db.add(user)
        db.flush() # Get user.id

        # 6. Database Insertion: STUDENT
        student = Student(
            user_id=user.id,
            first_name=data.get("firstName"),
            last_name=data.get("lastName"),
            university=data.get("university"),
            field_of_study=data.get("field_of_study"),
            degree_level=data.get("degree_level"),
            phone=data.get("phone"),
        )
        db.add(student)
        db.flush() # Get student.id

        # 7. Database Insertion: CV (storing binary PDF)
        cv = CV(
            student_id=student.id,
            title=f"CV_{data.get('lastName')}",
            file_data=pdf_bytes,
            file_name=file.filename or "cv.pdf",
        )
        db.add(cv)
        db.flush() # Get cv.id

        # 8. Loop: Adding Skills
        for s in data.get("skills", []):
            db.add(Skill(
                cv_id=cv.id, 
                name=s.get("name"), 
                category=s.get("category", "Tech"), 
                level=s.get("level", "Intermédiaire")
            ))

        # 9. Loop: Adding Experiences
        for exp in data.get("experiences", []):
            db.add(Experience(
                cv_id=cv.id,
                company_name=clean_company(exp.get("company")),
                role=exp.get("position"),
                description=exp.get("description"),
                start_date=clean_date(exp.get("start_date")),
                end_date=clean_date(exp.get("end_date")),
            ))

        # 10. Loop: Adding Languages
        for lang in data.get("languages", []):
            db.add(Language(
                cv_id=cv.id, 
                name=lang.get("name"), 
                level=lang.get("level", "B1")
            ))

        # 11. Loop: Adding Soft Skills
        for ss in data.get("soft_skills", []):
            db.add(SoftSkill(
                cv_id=cv.id, 
                name=ss.get("name"), 
                level=ss.get("level", "Moyen")
            ))

        # 12. Database Insertion: PREFERENCES
        preference = Preference(
            student_id   = student.id,
            availability = prefs_data.get("availability", "Immédiate"),
            sectors      = ",".join(prefs_data.get("sectors", [])),
            notif_offres = prefs_data.get("notifs", {}).get("offres", True),
            notif_hebdo  = prefs_data.get("notifs", {}).get("hebdo",  True),
            notif_recrut = prefs_data.get("notifs", {}).get("recrut", True),
        )
        db.add(preference)

        # 13. Final Commit
        db.commit()
        return {"status": "success", "message": "Inscription automatique réussie", "email": email}

    except Exception as e:
        db.rollback()
        print(f"CRITICAL ERROR DURING AUTO-REG: {str(e)}") # Visible in your Uvicorn console
        raise HTTPException(status_code=500, detail=f"Erreur d'insertion en base : {str(e)}")

# ════════════════════════════════════════════════
# 2. Parse CV (sans créer de compte)
# ════════════════════════════════════════════════
@router.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    """Parse le CV et retourne les données structurées sans créer de compte."""
    pdf_bytes = await file.read()
    raw_text  = extract_text_from_pdf(pdf_bytes)
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="PDF illisible ou scanné.")
    return ask_ai_to_format(raw_text)




# ════════════════════════════════════════════════
# 4. Register Company
# ════════════════════════════════════════════════
@router.post("/register/company")
def register_company(data: CompanyCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=data.email, password=hash_password(data.password), role="company")
    db.add(user)
    db.flush()

    company = Company(
        user_id=user.id,
        name=data.name,
        industry=data.industry,
        location=data.location,
    )
    db.add(company)
    db.commit()

    return {"message": "Company registered successfully", "company_id": company.id}




# ════════════════════════════════════════════════
# 5. Envoyer OTP
# ════════════════════════════════════════════════
@router.post("/send-otp")
async def send_otp(email: str = Form(...)):
    otp = generate_otp()
    otp_store[email] = {"code": otp, "expires_at": time.time() + 600}
    try:
        send_otp_email(email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossible d'envoyer l'email : {str(e)}")
    return {"message": f"Code OTP envoyé à {email}"}


# ════════════════════════════════════════════════
# 6. Vérifier OTP
# ════════════════════════════════════════════════
@router.post("/verify-otp")
async def verify_otp(email: str = Form(...), code: str = Form(...)):
    entry = otp_store.get(email)
    if not entry:
        raise HTTPException(status_code=400, detail="Aucun code envoyé pour cet email.")
    if time.time() > entry["expires_at"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="Code expiré.")
    if entry["code"] != code.strip():
        raise HTTPException(status_code=400, detail="Code incorrect.")
    return {"verified": True}


# ════════════════════════════════════════════════
# 7. Login
# ════════════════════════════════════════════════
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
# Configuration Sécurité
SECRET_KEY = "talentia_secret_key_change_in_production"
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440  # 24h

# Context pour le hachage (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict) -> str:
    """Génère un JWT signé."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)



from sqlalchemy.orm import  joinedload
@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # 1. Simple fetch - no joinedload to avoid the AttributeError
    user = db.query(User).filter(User.email == form.username.strip().lower()).first()

    # 2. Check if user exists and password is correct
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Prepare the base data for the token
    token_data = {
        "sub": user.email,
        "role": user.role,
        "id": user.id
    }

    # 4. MANUALLY query the profile based on the role
    if user.role == "student":
        student_profile = db.query(Student).filter(Student.user_id == user.id).first()
        if student_profile:
            token_data.update({
                "student_id": student_profile.id,
                "name": f"{student_profile.first_name} {student_profile.last_name}"
            })
            
    elif user.role == "company":
        # Make sure Company is imported at the top of the file
        company_profile = db.query(Company).filter(Company.user_id == user.id).first()
        if company_profile:
            token_data.update({
                "company_id": company_profile.id,
                "name": company_profile.name
            })

    # 5. Generate the JWT
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }
# ════════════════════════════════════════════════
# 6. Télécharger le CV PDF
# ════════════════════════════════════════════════
@router.get("/cv/{cv_id}/download")
def download_cv(cv_id: int, db: Session = Depends(get_db)):
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv or not cv.file_data:
        raise HTTPException(status_code=404, detail="CV introuvable")
    return Response(
        content=cv.file_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{cv.file_name or "cv.pdf"}"'}
    )