from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, default=lambda: str(uuid.uuid4()), unique=True)
    
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    
    cover_letter = Column(Text)
    additional_documents = Column(Text) # Store as JSON string or comma-separated paths
    
    status = Column(String, default="received") # received, reviewing, interview, accepted, rejected, withdrawn
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    viewed_by_company = Column(Boolean, default=False)
    viewed_at = Column(DateTime, nullable=True)
    
    company_feedback = Column(Text)
    
    interview_date = Column(DateTime, nullable=True)
    interview_location = Column(String)
    interview_type = Column(String) # InPerson, Video, Phone
    
    rejection_reason = Column(Text)
    withdrawal_reason = Column(Text)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="applications")
    student = relationship("Student", backref="applications")
