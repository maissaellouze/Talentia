from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

class SocieteBase(BaseModel):
    rne_id: Optional[str] = None
    name: Optional[str] = None
    legal_name: Optional[str] = None
    activity: Optional[str] = None
    sector: Optional[str] = None
    naf_code: Optional[str] = None
    legal_form: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    code_postal: Optional[int] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    verified_status: bool = False
    average_rating: Optional[float] = None
    review_count: int = 0
    social_media: Optional[Dict[str, Any]] = None

class SocieteCreate(SocieteBase):
    name: str
    email: str
    industry: Optional[str] = None
    activity: Optional[str] = None
    description: Optional[str] = None
    legal_name: Optional[str] = None
    sector: Optional[str] = None
    naf_code: Optional[str] = None
    legal_form: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    code_postal: Optional[Any] = None
    creation_year: Optional[Any] = None
    employee_count: Optional[Any] = None
    website: Optional[str] = None
    social_media: Optional[Dict[str, Any]] = None
    main_domain: Optional[str] = None
    secondary_domains: Optional[Any] = None
    technologies: Optional[Any] = None

class SocieteUpdate(SocieteBase):
    pass

class SocieteResponse(SocieteBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    data: List[SocieteResponse]
