from pydantic import BaseModel

class CompanyCreate(BaseModel):

    email: str
    password: str

    name: str
    description: str
    industry: str
    location: str
    website: str
    company_size: str