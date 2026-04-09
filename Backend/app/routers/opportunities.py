# Backend/app/routers/opportunities.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.cv import CV
from app.models.internship import Internship
from app.models.opportunity import Opportunity
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
    
    # 2. Get all real opportunities from the DB
    all_opportunities = db.query(Opportunity, Societe).join(Societe, Opportunity.company_id == Societe.id).all()
    results = []
    for opportunity, societe in all_opportunities:
        score = calculate_match_score(student_profile, opportunity)
        results.append({
            "opportunity": {
                "id": opportunity.id,
                "title": opportunity.title,
                "location": opportunity.location,
                "duration": opportunity.contract_type, # mapped for compatibility
                "description": opportunity.description,
                "company_name": societe.name,
                "company_logo": societe.logo,
                "sector": societe.sector,
                "contract_type": opportunity.contract_type,
                "remote_work": opportunity.remote_work,
                "salary_min": opportunity.salary_min,
                "salary_max": opportunity.salary_max
            },
            "match_score": score
        })

    return sorted(results, key=lambda x: x["match_score"], reverse=True)

@router.get("/{opp_id}")
def get_opportunity_detail(opp_id: int, db: Session = Depends(get_db)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    societe = db.query(Societe).filter(Societe.id == opportunity.company_id).first()
    
    return {
        "id": opportunity.id,
        "title": opportunity.title,
        "description": opportunity.description,
        "location": opportunity.location,
        "contract_type": opportunity.contract_type,
        "remote_work": opportunity.remote_work,
        "salary_min": opportunity.salary_min,
        "salary_max": opportunity.salary_max,
        "positions_available": opportunity.positions_available,
        "company_name": societe.name if societe else "Entreprise inconnue",
        "company_logo": societe.logo if societe else None,
        "company_description": societe.description if societe else "",
        "sector": societe.sector if societe else "",
        "requirements": [{"description": r.description} for r in opportunity.requirements],
        "benefits": [{"title": b.benefit_type, "description": b.description} for b in opportunity.benefits]
    }

from pydantic import BaseModel
class ApplyRequest(BaseModel):
    student_id: int

@router.post("/{opp_id}/apply")
def apply_to_opportunity(opp_id: int, request: ApplyRequest, db: Session = Depends(get_db)):
    from app.models.application import Application
    from datetime import datetime
    
    # Check if opportunity exists
    opportunity = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    # Check if student exists
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Check if already applied
    existing_application = db.query(Application).filter(
        Application.opportunity_id == opp_id, 
        Application.student_id == request.student_id
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied to this opportunity")
        
    # Create application
    new_application = Application(
        opportunity_id=opp_id,
        student_id=request.student_id,
        status="pending",
        submitted_at=datetime.utcnow()
    )
    # Update opportunity count
    opportunity.applications_count += 1
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return {"message": "Application submitted successfully", "application_id": new_application.id}