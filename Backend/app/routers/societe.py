from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import UploadFile, File, Form
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, func
from sqlalchemy.orm import Session, relationship
from typing import Optional, List
from app.database import SessionLocal, Base
from app.models.company import Societe
from app.models.review import Review
from app.schemas.company_schema import SocieteResponse, PaginatedResponse, SocieteCreate, SocieteUpdate
from app.schemas.review_schema import ReviewCreate, ReviewResponse
from app.models.pfe_report import PFEReport
import shutil, os
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/societes", response_model=List[SocieteResponse])
def get_societes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    sector: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all companies with optional filtering"""
    query = db.query(Societe)
    
    # Apply filters
    if search:
        query = query.filter(
            (Societe.name.ilike(f"%{search}%")) |
            (Societe.activity.ilike(f"%{search}%"))
        )
    if sector:
        query = query.filter(Societe.sector == sector)
    if city:
        query = query.filter(Societe.city.ilike(f"%{city}%"))
    
    # Apply pagination
    companies = query.offset(skip).limit(limit).all()
    return companies

@router.get("/societes/paginated", response_model=PaginatedResponse)
def get_societes_paginated(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    sector: Optional[str] = None,
    city: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated companies for better frontend performance"""
    query = db.query(Societe)
    
    # Apply filters
    if search:
        query = query.filter(
            (Societe.name.ilike(f"%{search}%")) |
            (Societe.activity.ilike(f"%{search}%"))
        )
    if sector:
        query = query.filter(Societe.sector == sector)
    if city:
        query = query.filter(Societe.city.ilike(f"%{city}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    companies = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "data": companies
    }

@router.get("/societes/{company_id}", response_model=SocieteResponse)
def get_societe(company_id: int, db: Session = Depends(get_db)):
    """Get a single company by ID"""
    company = db.query(Societe).filter(Societe.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.get("/filters/sectors")
def get_sectors(db: Session = Depends(get_db)):
    """Get all unique sectors for filtering"""
    sectors = db.query(Societe.sector).distinct().filter(Societe.sector.isnot(None)).all()
    return [s[0] for s in sectors if s[0]]

@router.get("/filters/cities")
def get_cities(db: Session = Depends(get_db)):
    """Get all unique cities for filtering"""
    cities = db.query(Societe.city).distinct().filter(Societe.city.isnot(None)).all()
    return [c[0] for c in cities if c[0]]

@router.post("/societes", response_model=SocieteResponse, status_code=201)
def create_societe(societe: SocieteCreate, db: Session = Depends(get_db)):
    """Create a new company"""
    db_societe = Societe(**societe.model_dump(exclude_unset=True))
    db.add(db_societe)
    db.commit()
    db.refresh(db_societe)
    return db_societe

@router.put("/societes/{company_id}", response_model=SocieteResponse)
def update_societe(company_id: int, societe: SocieteUpdate, db: Session = Depends(get_db)):
    """Update a company"""
    db_societe = db.query(Societe).filter(Societe.id == company_id).first()
    if not db_societe:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = societe.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_societe, key, value)
        
    db.commit()
    db.refresh(db_societe)
    return db_societe

@router.delete("/societes/{company_id}", status_code=204)
def delete_societe(company_id: int, db: Session = Depends(get_db)):
    """Delete a company"""
    db_societe = db.query(Societe).filter(Societe.id == company_id).first()
    if not db_societe:
        raise HTTPException(status_code=404, detail="Company not found")
        
    db.delete(db_societe)
    db.commit()
    return None

# --- Review Endpoints ---

@router.get("/societes/{company_id}/reviews", response_model=List[ReviewResponse])
def get_company_reviews(company_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a specific company"""
    reviews = db.query(Review).filter(Review.company_id == company_id).all()
    return reviews

@router.post("/societes/{id}/reviews")
def add_review(id: int, review_data: dict, db: Session = Depends(get_db)):
    from app.models.review import Review

    company = db.query(Societe).filter(Societe.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")

    review = Review(**review_data, company_id=id)
    db.add(review)

    # ✅ increment review count and recalculate average
    company.review_count = (company.review_count or 0) + 1
    if company.average_rating:
        company.average_rating = (
            (company.average_rating * (company.review_count - 1)) + review_data["rating"]
        ) / company.review_count
    else:
        company.average_rating = review_data["rating"]

    db.commit()
    db.refresh(review)
    return review





@router.get("/societes/{id}/pfe")
def get_pfe(id: int, db: Session = Depends(get_db)):
    return db.query(PFEReport).filter(PFEReport.company_id == id).all()

@router.post("/societes/{id}/pfe")
async def upload_pfe(
    id: int,
    title: str = Form(...),
    domain: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    company = db.query(Societe).filter(Societe.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    report = PFEReport(
        title=title,
        domain=domain,
        file_url=f"/uploads/{file.filename}",
        company_id=id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report