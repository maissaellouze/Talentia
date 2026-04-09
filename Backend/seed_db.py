import os
import sys
import pandas as pd
import json
import random
import sys
import os

# Ensure we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import SessionLocal
from app.models.company import Societe
from app.models.opportunity import Opportunity
import app.models.application
import app.models.pfe_report
import app.models.review
import app.models.user
import app.models.student
import app.models.cv
from sqlalchemy.orm import configure_mappers
configure_mappers()

def parse_int(val):
    try:
        return int(float(val))
    except:
        return None

def clean_str(val):
    if pd.isna(val) or val == 'NaT' or val == 'nan':
        return None
    return str(val).strip()

def seed():
    db = SessionLocal()
    
    print("Reading Companies CSV...")
    df_comp = pd.read_csv(r'c:\Users\Jenzeri\OneDrive\Desktop\2ING-2\miniprojet\Talentia\Scraping\societes_informatique_FULL.csv')
    df_comp = df_comp.fillna('')
    
    # Fill Companies
    company_ids = []
    print(f"Found {len(df_comp)} companies.")
    for idx, row in df_comp.iterrows():
        # Avoid duplicate rne_id
        rne = clean_str(row.get('idUnique'))
        if not rne:
            continue
            
        existing = db.query(Societe).filter(Societe.rne_id == rne).first()
        if existing:
            company_ids.append(existing.id)
            continue
            
        socials = {}
        if clean_str(row.get('linkedin')): socials['linkedin'] = clean_str(row.get('linkedin'))
        if clean_str(row.get('facebook')): socials['facebook'] = clean_str(row.get('facebook'))
        if clean_str(row.get('instagram')): socials['instagram'] = clean_str(row.get('instagram'))
        
        comp = Societe(
            rne_id=rne,
            name=clean_str(row.get('denomination', f'Societe {idx}')),
            legal_form=clean_str(row.get('formeJuridiqueFr')),
            activity=clean_str(row.get('domain')),
            sector=clean_str(row.get('Sector', 'IT')),
            address=clean_str(row.get('rueFr')),
            city=clean_str(row.get('villeFr')),
            code_postal=parse_int(row.get('codePostal')),
            phone=clean_str(row.get('phone')),
            email=clean_str(row.get('email')),
            website=clean_str(row.get('siteweb')),
            logo=clean_str(row.get('logo')),
            creation_year=parse_int(row.get('anneeDeCreation')),
            social_media=socials,
            is_verified=True,
            status="verified"
        )
        db.add(comp)
        db.commit()
        db.refresh(comp)
        company_ids.append(comp.id)

    print("Reading Opportunities CSV...")
    df_jobs = pd.read_csv(r'c:\Users\Jenzeri\OneDrive\Desktop\2ING-2\miniprojet\Talentia\Scraping\linkedin_jobs_junior_developer__all_all_any.csv')
    df_jobs = df_jobs.fillna('')
    
    print(f"Found {len(df_jobs)} jobs.")
    if not company_ids:
        print("No companies found to attach jobs to. Aborting.")
        return
        
    for idx, row in df_jobs.iterrows():
        title = clean_str(row.get('job_title'))
        if not title:
            continue
            
        # Randomly assign to a seeded company to populate the platform!
        cid = random.choice(company_ids)
        
        desc = clean_str(row.get('job_description', ''))
        benefits = clean_str(row.get('benefit', ''))
        if benefits:
            desc += "\n\nBenefits: " + benefits
            
        loc = clean_str(row.get('location', ''))
        country = clean_str(row.get('country', ''))
        if country and country not in loc:
            loc += f", {country}"
            
        opp = Opportunity(
            company_id=cid,
            title=title,
            description=desc,
            contract_type="CDI" if "senior" not in title.lower() else "CDD",
            experience_level="Junior",
            location=loc,
            is_active=True,
            is_verified=True,
        )
        db.add(opp)
        
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed()