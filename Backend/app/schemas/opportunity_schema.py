from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Optional

class RequirementBase(BaseModel):
    description: str
    is_mandatory: bool = True
    minimum_level: Optional[str] = None
    years_required: float = 0.0

class RequirementCreate(RequirementBase):
    pass

class RequirementResponse(RequirementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class BenefitBase(BaseModel):
    benefit_type: str
    description: Optional[str] = None
    value: Optional[str] = None

class BenefitCreate(BenefitBase):
    pass

class BenefitResponse(BenefitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class OpportunityBase(BaseModel):
    title: str
    description: str
    contract_type: str
    experience_level: str
    location: str
    remote_work: bool = False
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "TND"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    application_deadline: Optional[datetime] = None
    positions_available: int = 1

class OpportunityCreate(OpportunityBase):
    requirements: List[RequirementCreate] = []
    benefits: List[BenefitCreate] = []

class OpportunityResponse(OpportunityBase):
    id: int
    uuid: str
    company_id: int
    views_count: int
    applications_count: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    requirements: List[RequirementResponse]
    benefits: List[BenefitResponse]
    model_config = ConfigDict(from_attributes=True)
