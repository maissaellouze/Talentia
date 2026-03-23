import pandas as pd
from database import SessionLocal
from models import Societe
from sqlalchemy.exc import IntegrityError

CSV_FILE = r"societes_informatique_FULL.csv"

def clean(value, to_int=False):
    if pd.isna(value):
        return None
    if to_int:
        try:
            return int(float(value))
        except:
            return None
    v = str(value).strip()
    return v if v != "" else None

df = pd.read_csv(CSV_FILE)

print("CSV loaded")
print("Columns:", df.columns.tolist())

db = SessionLocal()

inserted = 0
skipped = 0
errors = 0

for index, row in df.iterrows():
    try:
        social_media = {
            "linkedin": clean(row.get("linkedin")),
            "facebook": clean(row.get("facebook")),
            "instagram": clean(row.get("instagram"))
        }

        societe = Societe(
            # --- Existing mapped fields ---
            rne_id=clean(row.get("idUnique")),
            name=clean(row.get("denomination")),
            legal_name=clean(row.get("denomination")),

            activity=clean(row.get("domain")),
            sector=clean(row.get("Sector")),
            main_domain=clean(row.get("domain")),

            address=clean(row.get("rueFr")),
            city=clean(row.get("villeFr")),
            code_postal=clean(row.get("codePostal"), to_int=True),

            creation_year=clean(row.get("anneeDeCreation"), to_int=True),
            legal_form=clean(row.get("formeJuridiqueFr")),

            website=clean(row.get("website")),
            email=clean(row.get("email")),
            phone=clean(row.get("phone")),

            # --- New structured fields ---
            social_media=social_media,

            # --- Missing → set to None (future enrichment) ---
            naf_code=None,
            headquarters=None,
            locations=None,
            employee_count=None,
            description=None,
            logo=None,
            secondary_domains=None,
            technologies=None,
            verified_status=False,
            average_rating=None,
            review_count=0
        )

        db.add(societe)
        inserted += 1

        if inserted % 500 == 0:
            db.commit()
            print(f"Committed {inserted} records...")

    except IntegrityError:
        db.rollback()
        skipped += 1
    except Exception as e:
        db.rollback()
        errors += 1
        print(f"Error at row {index}: {e}")

db.commit()
db.close()

print("\n===== IMPORT FINISHED =====")
print("Inserted:", inserted)
print("Skipped:", skipped)
print("Errors:", errors)
print("===========================\n")