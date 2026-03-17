from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Certificate(Base):

    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))

    title = Column(String)

    organization = Column(String)

    issue_date = Column(String)

    url = Column(String)

    description = Column(String)