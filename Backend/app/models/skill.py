from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Skill(Base):

    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    name = Column(String)

    category = Column(String)

    level = Column(String)