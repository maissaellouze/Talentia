from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class ApplicationBase(BaseModel):
    opportunity_id: int
    cover_letter: Optional[str] = None
    additional_documents: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    uuid: str
    student_id: int
    status: str
    submitted_at: datetime
    viewed_by_company: bool
    viewed_at: Optional[datetime] = None
    company_feedback: Optional[str] = None
    interview_date: Optional[datetime] = None
    interview_location: Optional[str] = None
    interview_type: Optional[str] = None
    rejection_reason: Optional[str] = None
    withdrawal_reason: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
