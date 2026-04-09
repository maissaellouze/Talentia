import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.models.internship import Internship
import app.models.company
import app.models.opportunity
import app.models.internship
import app.models.application
import app.models.pfe_report
import app.models.review
import app.models.user
import app.models.student
import app.models.cv
from sqlalchemy.orm import configure_mappers

configure_mappers()

def run_migration():
    db = SessionLocal()
    opps = db.query(Opportunity).all()
    count = 0
    for opp in opps:
        # Check if internship already exists
        exists = db.query(Internship).filter(Internship.title == opp.title, Internship.company_id == opp.company_id).first()
        if not exists:
            internship = Internship(
                company_id=opp.company_id,
                title=opp.title,
                description=opp.description,
                location=opp.location,
                duration="6 mois" if "stage" in opp.title.lower() else "Indéterminé",
                required_skills=""
            )
            db.add(internship)
            count += 1
            
    db.commit()
    print(f"Migrated {count} opportunities to internships successfully!")
    db.close()

if __name__ == "__main__":
    run_migration()
