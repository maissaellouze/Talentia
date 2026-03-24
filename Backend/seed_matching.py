import sys
import os
from sqlalchemy import text

# Add backend to path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models.company import Societe
from app.models.internship import Internship

def seed_matching_opportunity():
    db = SessionLocal()
    try:
        # 1. Create the Company
        company = db.query(Societe).filter(Societe.name == "Talentia Tech").first()
        if not company:
            company = Societe(
                name="Talentia Tech",
                legal_name="Talentia Solutions SARL",
                email="hr@talentia.tn",
                website="https://talentia.tn",
                rne_id="1234567A",
                verified_status=True
            )
            db.add(company)
            db.flush() 

        # 2. Create the Internship (Matches your skills: Python, React)
        job = db.query(Internship).filter(Internship.title == "Fullstack Developer Intern").first()
        if not job:
            job = Internship(
                company_id=company.id,
                title="Fullstack Developer Intern",
                description="Help us build the Talentia platform using React and Python (FastAPI).",
                required_skills="Python, React, Django",
                location="Sousse / Remote",
                duration="4 Months"
            )
            db.add(job)
            
        db.commit()
        print("✅ Success! Database updated and matching opportunity seeded.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_matching_opportunity()