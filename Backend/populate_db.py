import sys
import os
# Add the current directory to path so it can find 'app'
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine, Base
from app.models.student import Student
from app.models.cv import CV
from app.models.skill import Skill
from app.models.company import Societe
from app.models.internship import Internship
from app.models.preference import Preference

def seed():
    db = SessionLocal()
    # 1. Create a Student (You)
    mayssam = Student(first_name="Mayssam", last_name="Slimani", email="mayssam@example.com")
    db.add(mayssam)
    db.commit()
    db.refresh(mayssam)

    # 2. Create CV and Skills
    cv = CV(student_id=mayssam.id)
    db.add(cv)
    db.commit()
    db.refresh(cv)

    skills = [
        Skill(cv_id=cv.id, name="Python", category="Backend"),
        Skill(cv_id=cv.id, name="React", category="Frontend"),
        Skill(cv_id=cv.id, name="FastAPI", category="Backend"),
        Skill(cv_id=cv.id, name="SQL", category="Database")
    ]
    db.add_all(skills)

    # 3. Create Real Companies
    vermeg = Societe(name="Vermeg", sector="Fintech", city="Tunis", logo="https://logo.clearbit.com/vermeg.com")
    instadeep = Societe(name="Instadeep", sector="AI", city="Tunis", logo="https://logo.clearbit.com/instadeep.com")
    db.add_all([vermeg, instadeep])
    db.commit()

    # 4. Create Internships
    jobs = [
        Internship(company_id=vermeg.id, title="PFE Fullstack Developer", required_skills="Python, React, SQL", location="Tunis", duration="6 months"),
        Internship(company_id=instadeep.id, title="AI Engineering Intern", required_skills="Python, FastAPI, AI", location="Tunis", duration="4 months"),
        Internship(company_id=vermeg.id, title="Backend Specialist", required_skills="Java, Spring", location="Tunis", duration="6 months")
    ]
    db.add_all(jobs)
    db.commit()
    
    print("Database populated successfully! Check your UI now.")
    db.close()

if __name__ == "__main__":
    seed()