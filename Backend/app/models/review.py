from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"))

    title = Column(String)
    content = Column(Text)
    rating = Column(Integer)

    supervision = Column(Integer)
    work_environment = Column(Integer)
    salary = Column(Integer)
    learning = Column(Integer)
    atmosphere = Column(Integer)
    work_life_balance = Column(Integer)
    career_growth = Column(Integer)
    company_culture = Column(Integer)

    start_date = Column(Date)
    end_date = Column(Date)
    position = Column(String)

    is_anonymous = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="approved")

    company = relationship("Societe", back_populates="reviews")