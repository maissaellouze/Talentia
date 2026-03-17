from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Club(Base):

    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    name = Column(String)

    role = Column(String)

    description = Column(String)