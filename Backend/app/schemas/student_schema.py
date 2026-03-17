from pydantic import BaseModel
from typing import List


class SkillCreate(BaseModel):
    name: str
    category: str
    level: str


class SoftSkillCreate(BaseModel):
    name: str
    level: str


class ExperienceCreate(BaseModel):
    company_name: str
    role: str
    description: str
    start_date: str
    end_date: str


class EducationCreate(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    specialization: str
    start_year: int
    end_year: int
    grade: str
    description: str


class LanguageCreate(BaseModel):
    name: str
    level: str


class CertificateCreate(BaseModel):
    title: str
    organization: str
    issue_date: str
    url: str
    description: str


class ClubCreate(BaseModel):
    name: str
    role: str
    description: str


class StudentRegister(BaseModel):

    email: str
    password: str

    first_name: str
    last_name: str
    phone: str

    university: str
    field_of_study: str
    degree_level: str
    graduation_year: int

    bio: str

    linkedin: str
    github: str

    skills: List[SkillCreate]
    soft_skills: List[SoftSkillCreate]
    experiences: List[ExperienceCreate]
    educations: List[EducationCreate]
    languages: List[LanguageCreate]
    certificates: List[CertificateCreate]
    clubs: List[ClubCreate]