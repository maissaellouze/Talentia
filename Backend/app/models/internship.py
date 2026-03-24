from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String)
    description = Column(Text)
    required_skills = Column(Text)  # Store as comma-separated string or JSON
    location = Column(String)
    duration = Column(String)