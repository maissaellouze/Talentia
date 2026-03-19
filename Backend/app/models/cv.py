from sqlalchemy import Column, Integer, LargeBinary, String, ForeignKey
from app.database import Base

class CV(Base):

    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True)

    student_id = Column(Integer, ForeignKey("students.id"))

    title = Column(String)

    language = Column(String)
    
    file_url = Column(String)
    file_data  = Column(LargeBinary, nullable=True) 
    file_name  = Column(String, nullable=True)  