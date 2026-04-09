from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class PFEReport(Base):
    __tablename__ = "pfe_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    domain = Column(String)
    author = Column(String, nullable=True)
    university = Column(String, nullable=True)
    year = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    views = Column(Integer, default=0)
    
    file_url = Column(String)
    content_text = Column(Text)
    embedding = Column(Text)  # JSON string
    
    company_id   = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company = relationship("Societe", back_populates="pfe_reports")
    
    created_at = Column(DateTime, default=datetime.utcnow)