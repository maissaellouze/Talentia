from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PFEReport(Base):
    __tablename__ = "pfe_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    domain = Column(String)
    file_url = Column(String)
    content_text = Column(Text)
    embedding = Column(Text)  # JSON string
    company_id   = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company = relationship("Societe", back_populates="pfe_reports")  # ← add this