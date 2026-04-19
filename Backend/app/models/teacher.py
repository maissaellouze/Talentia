from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.database import Base
from sqlalchemy.orm import relationship


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    first_name = Column(String)
    last_name = Column(String)
    department = Column(String) # ex: Génie Logiciel, Réseaux
    specialty = Column(String)  # ex: IA, Cyber-sécurité
    university = Column(String)

    user = relationship("User", back_populates="teacher")
    # Relation avec les idées de projets qu'il propose
    suggested_topics = relationship("ProjectIdea", back_populates="teacher")