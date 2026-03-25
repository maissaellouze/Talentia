# Backend/app/routers/opportunities.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.cv import CV
from app.models.internship import Internship
from app.models.skill import Skill
from app.models.experience import Experience
from app.models.education import Education
from app.models.language import Language
from app.models.soft_skill import SoftSkill
from app.models.preference import Preference
from app.utils.matching import calculate_match_score
from app.models.company import Societe

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.get("/")
def get_ranked_opportunities(student_id: int, db: Session = Depends(get_db)):
    # 1. Gather the full student profile linked to their CV
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    cv = db.query(CV).filter(CV.student_id == student_id).first()
    if not cv:
        student_profile = {
            "skills": [], "experiences": [], "education": [],
            "languages": [], "soft_skills": [], "preferences": None
        }
    else:
        student_profile = {
            "skills": db.query(Skill).filter(Skill.cv_id == cv.id).all(),
            "experiences": db.query(Experience).filter(Experience.cv_id == cv.id).all(),
            "education": db.query(Education).filter(Education.cv_id == cv.id).all(),
            "languages": db.query(Language).filter(Language.cv_id == cv.id).all(),
            "soft_skills": db.query(SoftSkill).filter(SoftSkill.cv_id == cv.id).all(),
            "preferences": db.query(Preference).filter(Preference.student_id == student_id).first()
        }
    
    # 2. Get all real internships from the DB
    all_internships = db.query(Internship, Societe).join(Societe, Internship.company_id == Societe.id).all()
    results = []
    for internship, societe in all_internships:
        score = calculate_match_score(student_profile, internship)
        results.append({
            "internship": {
                "id": internship.id,
                "title": internship.title,
                "location": internship.location,
                "duration": internship.duration,
                "description": internship.description,
                "company_name": societe.name, # Real name from DB
                "company_logo": societe.logo, # Real logo from DB
                "sector": societe.sector
            },
            "match_score": score
        })

    return sorted(results, key=lambda x: x["match_score"], reverse=True)