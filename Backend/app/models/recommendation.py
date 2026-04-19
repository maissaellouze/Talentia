from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class RecommendationRequest(Base):
    __tablename__ = "recommendation_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    
    # Détails de la demande
    purpose = Column(String, nullable=False)  # Ex: "Master en IA", "Stage chez Google"
    additional_info = Column(Text, nullable=True) # Message de l'étudiant
    
    # La réponse du prof
    status = Column(String, default="pending") # pending, completed, rejected
    content = Column(Text, nullable=True) # La lettre écrite par le prof
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student")
    teacher = relationship("Teacher")