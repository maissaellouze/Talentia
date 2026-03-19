from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base

class Preference(Base):
    __tablename__ = "preferences"
    id           = Column(Integer, primary_key=True)
    student_id   = Column(Integer, ForeignKey("students.id"), unique=True)
    availability = Column(String, default="Immédiate")
    sectors      = Column(String, default="")
    notif_offres = Column(Boolean, default=True)
    notif_hebdo  = Column(Boolean, default=True)
    notif_recrut = Column(Boolean, default=True)