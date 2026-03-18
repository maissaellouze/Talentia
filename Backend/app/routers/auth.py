import os
import json
import fitz  # PyMuPDF
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from huggingface_hub import InferenceClient

from app.database import get_db
from app.utils.security import hash_password

from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.cv import CV
from app.models.skill import Skill
from app.models.soft_skill import SoftSkill
from app.models.experience import Experience
from app.models.education import Education
from app.models.language import Language
from app.models.certificate import Certificate
from app.models.club import Club

from app.schemas.student_schema import StudentRegister
from app.schemas.company_schema import CompanyCreate

# --- Configuration IA ---
# Remplace par ton token depuis https://huggingface.co/settings/tokens
HF_TOKEN = "token here "
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)

router = APIRouter(prefix="/auth", tags=["Registration"])


# --- Utility functions ---

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text


def ask_ai_to_format(raw_text: str) -> dict:
    system_instruction = (
        "Tu es un expert RH. Extrais les infos en JSON STRICT. "
        "IMPORTANT: Référence actuelle pour 'Présent' : Mars 2026."
    )
    prompt = f"""Extrais les données du CV suivant en respectant ce format JSON EXACT :
    {{
        "email": "email@exemple.com",
        "firstName": "Prénom",
        "lastName": "Nom",
        "university": "Université actuelle",
        "field_of_study": "Domaine d'études",
        "degree_level": "Niveau actuel",
        "phone": "Téléphone",
        "skills": [{{"name": "Skill", "category": "Tech", "level": "Intermédiaire"}}],
        "education": [{{"institution": "Ecole", "degree": "Diplôme", "field_of_study": "Domaine", "start_year": 2020, "end_year": 2023, "grade": "Mention", "description": "Détails"}}],
        "experiences": [{{"company": "Entreprise", "position": "Poste", "description": "Détails", "start_date": "2023-01-01", "end_date": "2024-01-01"}}],
        "languages": [{{"name": "Français", "level": "Courant"}}],
        "soft_skills": [{{"name": "Leadership", "level": "Avancé"}}]
    }}
    Texte du CV : {raw_text}"""

    response = client.chat_completion(
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ],
        max_tokens=2000,
        temperature=0.1,
    )
    content = response.choices[0].message.content.strip()
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=422,
            detail=f"L'IA a retourné un JSON invalide. Réessaie. ({e})",
        )


# ==============================
# 1. Register Student (Manuel)
# ==============================
@router.post("/register/student")
def register_student(data: StudentRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=data.email, password=hash_password(data.password), role="student")
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        university=data.university,
        field_of_study=data.field_of_study,
        degree_level=data.degree_level,
        graduation_year=data.graduation_year,
        phone=data.phone,
    )
    db.add(student)
    db.flush()

    cv = CV(student_id=student.id, title="Main CV")
    db.add(cv)
    db.flush()

    for skill in data.skills:
        db.add(Skill(cv_id=cv.id, name=skill.name, category=skill.category, level=skill.level))

    for exp in data.experiences:
        db.add(Experience(
            cv_id=cv.id,
            company_name=exp.company_name,
            role=exp.role,
            description=exp.description,
            start_date=exp.start_date,
            end_date=exp.end_date,
        ))

    for edu in data.educations:
        db.add(Education(
            cv_id=cv.id,
            institution=edu.institution,
            degree=edu.degree,
            field_of_study=edu.field_of_study,
            specialization=edu.specialization,
            start_year=edu.start_year,
            end_year=edu.end_year,
            grade=edu.grade,
            description=edu.description,
        ))

    for lang in data.languages:
        db.add(Language(cv_id=cv.id, name=lang.name, level=lang.level))

    for ss in data.soft_skills:
        db.add(SoftSkill(cv_id=cv.id, name=ss.name, level=ss.level))

    db.commit()
    return {"message": "Student registered successfully", "student_id": student.id}


# ==============================
# 2. Register Student (Auto via IA)
# email extrait du CV automatiquement
# password saisi par l'utilisateur
# ==============================
@router.post("/register/student/auto")
async def register_student_auto(
    password: str = Form(...),      # Seul le mot de passe est saisi par l'utilisateur
    file: UploadFile = File(...),   # Le CV PDF contient l'email
    db: Session = Depends(get_db),
):
    pdf_bytes = await file.read()
    raw_text = extract_text_from_pdf(pdf_bytes)
    data = ask_ai_to_format(raw_text)

    # Email récupéré automatiquement depuis le CV
    email = data.get("email")
    if not email:
        raise HTTPException(
            status_code=422,
            detail="Aucun email trouvé dans le CV. Assure-toi que ton CV contient bien une adresse email."
        )

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=400,
            detail=f"L'email '{email}' extrait du CV est déjà enregistré."
        )

    user = User(email=email, password=hash_password(password), role="student")
    db.add(user)
    db.flush()

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
    db.flush()

    cv = CV(student_id=student.id, title="CV Automatique")
    db.add(cv)
    db.flush()

    for s in data.get("skills", []):
        db.add(Skill(
            cv_id=cv.id,
            name=s.get("name"),
            category=s.get("category"),
            level=s.get("level"),
        ))

    for exp in data.get("experiences", []):
        db.add(Experience(
            cv_id=cv.id,
            company_name=exp.get("company"),
            role=exp.get("position"),
            description=exp.get("description"),
            start_date=exp.get("start_date"),
            end_date=exp.get("end_date"),
        ))

    for edu in data.get("education", []):
        db.add(Education(
            cv_id=cv.id,
            institution=edu.get("institution"),
            degree=edu.get("degree"),
            field_of_study=edu.get("field_of_study"),
            start_year=edu.get("start_year"),
            end_year=edu.get("end_year"),
            grade=edu.get("grade"),
            description=edu.get("description"),
        ))

    for lang in data.get("languages", []):
        db.add(Language(cv_id=cv.id, name=lang.get("name"), level=lang.get("level")))

    for ss in data.get("soft_skills", []):
        db.add(SoftSkill(cv_id=cv.id, name=ss.get("name"), level=ss.get("level")))

    db.commit()
    return {
        "message": "Inscription réussie via IA",
        "student_id": student.id,
        "email_detected": email,   # Retourné pour confirmation côté frontend
    }


# ==============================
# 3. Register Company
# ==============================
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