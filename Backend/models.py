from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Experience(BaseModel):
    poste: str
    entreprise: str
    annee: str

class ResumeData(BaseModel):
    nom_complet: str
    email: EmailStr
    telephone: Optional[str]
    competences: List[str]
    experiences: List[Experience]
    resume_biographie: str