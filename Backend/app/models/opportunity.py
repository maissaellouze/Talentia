from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, default=lambda: str(uuid.uuid4()), unique=True)
    
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    title = Column(String, nullable=False)
    description = Column(Text)
    contract_type = Column(String) # Internship, CDI, CDD, etc.
    experience_level = Column(String) # Beginner, Intermediate, etc.
    location = Column(String)
    remote_work = Column(Boolean, default=False)
    
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String, default="TND")
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    application_deadline = Column(DateTime, nullable=True)
    
    positions_available = Column(Integer, default=1)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Societe", back_populates="opportunities")
    requirements = relationship("OpportunityRequirement", back_populates="opportunity", cascade="all, delete-orphan")
    benefits = relationship("OpportunityBenefit", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")

class OpportunityRequirement(Base):
    __tablename__ = "opportunity_requirements"
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    
    description = Column(Text, nullable=False)
    is_mandatory = Column(Boolean, default=True)
    minimum_level = Column(String) # Beginner, Intermediate, etc.
    years_required = Column(Float, default=0.0)

    opportunity = relationship("Opportunity", back_populates="requirements")

class OpportunityBenefit(Base):
    __tablename__ = "opportunity_benefits"
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    
    benefit_type = Column(String)
    description = Column(Text)
    value = Column(String)

    opportunity = relationship("Opportunity", back_populates="benefits")
