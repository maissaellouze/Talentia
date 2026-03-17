from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class SoftSkill(Base):

    __tablename__ = "soft_skills"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    name = Column(String)

    level = Column(String)