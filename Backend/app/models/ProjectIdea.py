from sqlalchemy import Column, Integer, String, ForeignKey, Text, LargeBinary, DateTime
from app.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class ProjectIdea(Base):
    __tablename__ = "project_ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(String) 
    difficulty_level = Column(String) 
    specifications_pdf = Column(LargeBinary, nullable=True)
    pdf_filename = Column(String, nullable=True)
    status = Column(String, default="pending") # 'pending' pour attente de validation
    created_at = Column(DateTime, default=datetime.utcnow)
    feedback = Column(Text, nullable=True) # Stockera l'excuse ou le commentaire du prof
    # --- LIAISONS ---
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)

    student = relationship("Student", back_populates="project_ideas")
    teacher = relationship("Teacher", back_populates="suggested_topics")