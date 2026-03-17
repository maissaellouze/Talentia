from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    first_name = Column(String)
    last_name = Column(String)

    university = Column(String)
    field_of_study = Column(String)
    degree_level = Column(String)

    graduation_year = Column(Integer)

    bio = Column(Text)

    linkedin = Column(String)
    github = Column(String)

    phone = Column(String)