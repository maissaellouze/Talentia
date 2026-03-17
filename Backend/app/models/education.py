from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Education(Base):

    __tablename__ = "educations"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    institution = Column(String)

    degree = Column(String)

    field_of_study = Column(String)

    specialization = Column(String)

    start_year = Column(Integer)

    end_year = Column(Integer)

    grade = Column(String)

    description = Column(String)