from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Language(Base):

    __tablename__ = "languages"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    name = Column(String)

    level = Column(String)