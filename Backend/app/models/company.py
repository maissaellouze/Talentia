from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Company(Base):

    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String)

    description = Column(String)

    industry = Column(String)

    location = Column(String)

    website = Column(String)

    company_size = Column(String)