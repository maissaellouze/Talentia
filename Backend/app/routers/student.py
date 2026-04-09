from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.user import User
from app.models.cv import CV
from app.models.skill import Skill
from app.models.language import Language
from typing import List

router = APIRouter(prefix="/student", tags=["Student Profile"])

@router.get("/me")
def get_student_profile(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    user = db.query(User).filter(User.id == student.user_id).first()
    cv = db.query(CV).filter(CV.student_id == student_id).first()
    
    skills = db.query(Skill).filter(Skill.cv_id == cv.id).all() if cv else []
    languages = db.query(Language).filter(Language.cv_id == cv.id).all() if cv else []
    
    # We create a dictionary to combine student and user info
    student_data = {
        "id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "email": user.email if user else "",
        "university": student.university,
        "field_of_study": student.field_of_study,
        "degree_level": student.degree_level,
        "graduation_year": student.graduation_year,
        "bio": student.bio,
        "linkedin": student.linkedin,
        "github": student.github,
        "phone": student.phone,
        "skills": [{"name": s.name, "level": s.level} for s in skills],
        "languages": [{"name": l.name, "level": l.level} for l in languages]
    }
    return student_data

@router.put("/me")
def update_student_profile(student_id: int, data: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")
    
    # Update Email
    if "email" in data:
        user = db.query(User).filter(User.id == student.user_id).first()
        if user:
            user.email = data.pop("email")
            
    # Update Skills and Languages by dropping and re-adding if provided
    cv = db.query(CV).filter(CV.student_id == student_id).first()
    
    if "skills" in data and cv:
        skills_data = data.pop("skills")
        db.query(Skill).filter(Skill.cv_id == cv.id).delete()
        for s in skills_data:
            db.add(Skill(cv_id=cv.id, name=s.get("name"), level=s.get("level", "Débutant")))
            
    if "languages" in data and cv:
        langs_data = data.pop("languages")
        db.query(Language).filter(Language.cv_id == cv.id).delete()
        for l in langs_data:
            db.add(Language(cv_id=cv.id, name=l.get("name"), level=l.get("level", "Débutant")))
            
    # Update remaining student fields
    for key, value in data.items():
        if hasattr(student, key):
            setattr(student, key, value)
            
    db.commit()
    return {"message": "Profil mis à jour avec succès"}

@router.delete("/me")
def delete_student_account(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Étudiant non trouvé")

    user = db.query(User).filter(User.id == student.user_id).first()
    
    # Due to cascades or explicit manual deletion
    db.delete(student)
    if user:
        db.delete(user)
    
    db.commit()
    return {"message": "Le compte étudiant a été supprimé definitivement"}

@router.get("/my-applications")
def get_my_applications(student_id: int, db: Session = Depends(get_db)):
    from app.models.application import Application
    from app.models.opportunity import Opportunity
    from app.models.company import Societe
    
    apps = db.query(Application).filter(Application.student_id == student_id).all()
    
    results = []
    for app in apps:
        opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()
        company = db.query(Societe).filter(Societe.id == opp.company_id).first() if opp else None
        results.append({
            "id": app.id,
            "opportunity_id": app.opportunity_id,
            "opportunity_title": opp.title if opp else "Offre supprimée",
            "company_name": company.name if company else "Entreprise inconnue",
            "company_logo": company.logo if company else None,
            "status": app.status,
            "submitted_at": app.submitted_at.strftime("%Y-%m-%d") if app.submitted_at else "Inconnue",
        })
    return results
