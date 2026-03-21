from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import SessionLocal
from app.models.company import Societe
from app.schemas.company_schema import SocieteResponse, PaginatedResponse, SocieteCreate, SocieteUpdate

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