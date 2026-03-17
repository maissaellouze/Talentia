from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.security import hash_password

from app.models.user import User
from app.models.student import Student
from app.models.company import Company
from app.models.cv import CV
from app.models.skill import Skill
from app.models.soft_skill import SoftSkill
from app.models.experience import Experience
from app.models.education import Education
from app.models.language import Language
from app.models.certificate import Certificate
from app.models.club import Club

from app.schemas.student_schema import StudentRegister
from app.schemas.company_schema import CompanyCreate


router = APIRouter()


# ==============================
# Register Student
# ==============================

@router.post("/register/student")
def register_student(data: StudentRegister, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        return {"error": "Email already registered"}

    # Create user
    user = User(
        email=data.email,
        password=hash_password(data.password),
        role="student"
    )

    db.add(user)
    db.flush()  # get user.id without commit

    # Create student
    student = Student(
    user_id=user.id,
    first_name=data.first_name,
    last_name=data.last_name,
    university=data.university,
    field_of_study=data.field_of_study,
    degree_level=data.degree_level,
    graduation_year=data.graduation_year,
    bio=data.bio,
    linkedin=data.linkedin,
    github=data.github,
    phone=data.phone
)

    db.add(student)
    db.commit()
    db.refresh(student)
    # Create CV
    cv = CV(
        student_id=student.id,
        title="Main CV",
        language="fr",
        file_url=""
    )

    db.add(cv)
    db.flush()

    # Skills
    for skill in data.skills:
        db.add(
            Skill(
                cv_id=cv.id,
                name=skill.name,
                category=skill.category,
                level=skill.level
            )
        )

    # Soft Skills
    for s in data.soft_skills:
        db.add(
            SoftSkill(
                cv_id=cv.id,
                name=s.name,
                level=s.level
            )
        )

    # Experiences
    for exp in data.experiences:
        db.add(
            Experience(
                cv_id=cv.id,
                company_name=exp.company_name,
                role=exp.role,
                description=exp.description,
                start_date=exp.start_date,
                end_date=exp.end_date
            )
        )

    # Education
    for edu in data.educations:
        db.add(
            Education(
                cv_id=cv.id,
                institution=edu.institution,
                degree=edu.degree,
                field_of_study=edu.field_of_study,
                specialization=edu.specialization,
                start_year=edu.start_year,
                end_year=edu.end_year,
                grade=edu.grade,
                description=edu.description
            )
        )

    # Languages
    for lang in data.languages:
        db.add(
            Language(
                cv_id=cv.id,
                name=lang.name,
                level=lang.level
            )
        )

    # Certificates
    for cert in data.certificates:
        db.add(
            Certificate(
                cv_id=cv.id,
                title=cert.title,
                organization=cert.organization,
                issue_date=cert.issue_date,
                url=cert.url,
                description=cert.description
            )
        )

    # Clubs
    for club in data.clubs:
        db.add(
            Club(
                cv_id=cv.id,
                name=club.name,
                role=club.role,
                description=club.description
            )
        )

    # Final commit
    db.commit()

    return {"message": "Student registered successfully"}


# ==============================
# Register Company
# ==============================

@router.post("/register/company")
def register_company(data: CompanyCreate, db: Session = Depends(get_db)):

    # Check if email exists
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        return {"error": "Email already registered"}

    # Create user
    user = User(
        email=data.email,
        password=hash_password(data.password),
        role="company"
    )

    db.add(user)
    db.flush()

    # Create company
    company = Company(
        user_id=user.id,
        name=data.name,
        description=data.description,
        industry=data.industry,
        location=data.location,
        website=data.website,
        company_size=data.company_size
    )

    db.add(company)

    db.commit()

    return {"message": "Company registered successfully"}