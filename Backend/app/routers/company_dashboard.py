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
