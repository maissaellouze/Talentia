from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Experience(Base):

    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    company_name = Column(String)

    role = Column(String)

    description = Column(String)

    start_date = Column(String)

    end_date = Column(String)