from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional

class ReviewBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    rating: int
    supervision: Optional[int] = None
    work_environment: Optional[int] = None
    salary: Optional[int] = None
    learning: Optional[int] = None
    atmosphere: Optional[int] = None
    work_life_balance: Optional[int] = None
    career_growth: Optional[int] = None
    company_culture: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    position: Optional[str] = None
    is_anonymous: bool = True

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    company_id: int
    is_verified: bool
    helpful_count: int
    created_at: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)
