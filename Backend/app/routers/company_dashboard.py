from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.company import Societe as Company
from app.models.opportunity import Opportunity, OpportunityRequirement, OpportunityBenefit
from app.models.application import Application
from app.models.user import User
from app.schemas.opportunity_schema import OpportunityCreate, OpportunityResponse
from app.schemas.application_schema import ApplicationResponse
from app.utils.security import hash_password

router = APIRouter(prefix="/company", tags=["Company Dashboard"])

# Placeholder for actual auth dependency
def get_current_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return company

@router.get("/me", response_model=None)
def get_company_profile(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    return company

@router.put("/me")
def update_company_profile(company_id: int, data: dict, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    for key, value in data.items():
        if hasattr(company, key):
            setattr(company, key, value)
    db.commit()
    return {"message": "Profil mis à jour"}

@router.delete("/me")
def delete_account(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    db.delete(company)
    db.commit()
    return {"message": "Compte supprimé"}

@router.post("/opportunities", response_model=OpportunityResponse)
def create_opportunity(company_id: int, data: OpportunityCreate, db: Session = Depends(get_db)):
    opp = Opportunity(
        company_id=company_id,
        title=data.title,
        description=data.description,
        contract_type=data.contract_type,
        experience_level=data.experience_level,
        location=data.location,
        remote_work=data.remote_work,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        salary_currency=data.salary_currency,
        start_date=data.start_date,
        end_date=data.end_date,
        application_deadline=data.application_deadline,
        positions_available=data.positions_available
    )
    db.add(opp)
    db.flush()
    
    for req in data.requirements:
        db.add(OpportunityRequirement(opportunity_id=opp.id, **req.dict()))
    
    for ben in data.benefits:
        db.add(OpportunityBenefit(opportunity_id=opp.id, **ben.dict()))
        
    db.commit()
    db.refresh(opp)
    return opp

@router.get("/opportunities/all")
async def get_all_opportunities(db: Session = Depends(get_db)):
    """Public endpoint to fetch all opportunities for the student feed"""
    return db.query(Opportunity).all()

@router.get("/opportunities", response_model=List[OpportunityResponse])
def get_my_opportunities(company_id: int, db: Session = Depends(get_db)):
    return db.query(Opportunity).filter(Opportunity.company_id == company_id).all()

@router.put("/opportunities/{opp_id}", response_model=OpportunityResponse)
def update_opportunity(opp_id: int, company_id: int, data: OpportunityCreate, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id, Opportunity.company_id == company_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    
    # Update core fields
    for key, value in data.dict(exclude={'requirements', 'benefits'}).items():
        setattr(opp, key, value)
    
    # Update Requirements (Delete and Re-insert)
    db.query(OpportunityRequirement).filter(OpportunityRequirement.opportunity_id == opp_id).delete()
    for req in data.requirements:
        db.add(OpportunityRequirement(opportunity_id=opp.id, **req.dict()))
    
    # Update Benefits (Delete and Re-insert)
    db.query(OpportunityBenefit).filter(OpportunityBenefit.opportunity_id == opp_id).delete()
    for ben in data.benefits:
        db.add(OpportunityBenefit(opportunity_id=opp.id, **ben.dict()))
        
    db.commit()
    db.refresh(opp)
    return opp

@router.delete("/opportunities/{opp_id}")
def delete_opportunity(opp_id: int, company_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id, Opportunity.company_id == company_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    db.delete(opp)
    db.commit()
    return {"message": "Offre supprimée"}

@router.get("/opportunities/{opp_id}/applications")
def get_opportunity_applications(opp_id: int, company_id: int, db: Session = Depends(get_db)):
    from app.models.student import Student
    from app.models.education import Education
    from app.models.user import User
    
    # Verify company owns this opportunity
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id, Opportunity.company_id == company_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    applications = db.query(Application, Student).join(Student, Application.student_id == Student.id).filter(Application.opportunity_id == opp_id).all()
    
    results = []
    for app, student in applications:
        user = db.query(User).filter(User.id == student.user_id).first()
        results.append({
            "id": app.id,
            "student_id": student.id,
            "student_name": f"{student.first_name} {student.last_name}",
            "email": user.email if user else "",
            "major": student.field_of_study,
            "university": student.university,
            "status": app.status,
            "applied_at": app.submitted_at.strftime("%Y-%m-%d") if app.submitted_at else "Récemment",
            "gpa": None, # Could be calculated from DB if grades existed
            "avatar": f"{str(student.first_name)[0]}{str(student.last_name)[0]}".upper()
        })
    return results

from pydantic import BaseModel
class ApplicationStatusUpdate(BaseModel):
    status: str

@router.patch("/applications/{app_id}")
def update_application_status(app_id: int, company_id: int, data: ApplicationStatusUpdate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Verify company owns the opportunity
    opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id, Opportunity.company_id == company_id).first()
    if not opp:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    app.status = data.status
    db.commit()
    return {"message": "Status updated successfully"}

@router.get("/students")
def get_all_talents(company_id: int, db: Session = Depends(get_db)):
    from app.models.student import Student
    from app.models.user import User
    from app.models.cv import CV
    from app.models.skill import Skill
    
    # Ideally verify company exists
    students = db.query(Student).all()
    
    results = []
    for student in students:
        cv = db.query(CV).filter(CV.student_id == student.id).first()
        skills = []
        if cv:
            skills_db = db.query(Skill).filter(Skill.cv_id == cv.id).all()
            skills = [s.name for s in skills_db]
            
        user = db.query(User).filter(User.id == student.user_id).first()
            
        results.append({
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": user.email if user else "",
            "university": student.university,
            "field_of_study": student.field_of_study,
            "degree_level": student.degree_level,
            "skills": skills,
            "bio": student.bio,
            "linkedin": student.linkedin,
            "github": student.github
        })
    return results
