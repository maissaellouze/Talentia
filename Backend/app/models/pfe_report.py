from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class PFEReport(Base):
    __tablename__ = "pfe_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    domain = Column(String)
    file_url = Column(String)
    content_text = Column(Text)
    embedding = Column(Text)  # JSON string