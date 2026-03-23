from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON
from app.database import Base

class Societe(Base):#hiya samatha company
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    # --- Core identity ---
    rne_id = Column(String, unique=True, index=True)
    name = Column(Text)
    legal_name = Column(Text, nullable=True)

    # --- Business info ---
    activity = Column(Text, nullable=True)
    sector = Column(Text, nullable=True)
    naf_code = Column(String, nullable=True)
    legal_form = Column(String, nullable=True)

    # --- Location ---
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    code_postal = Column(Integer, nullable=True)
    headquarters = Column(String, nullable=True)
    locations = Column(JSON, nullable=True)  # list of locations

    # --- Company details ---
    creation_year = Column(Integer, nullable=True)
    employee_count = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)

    # --- Online presence ---
    website = Column(String, nullable=True)
    logo = Column(String, nullable=True)

    # --- Social media (better structure) ---
    social_media = Column(JSON, nullable=True)

    # --- Domains & tech ---
    main_domain = Column(String, nullable=True)
    secondary_domains = Column(JSON, nullable=True)
    technologies = Column(JSON, nullable=True)

    # --- Contact ---
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # --- Extra ---
    verified_status = Column(Boolean, default=False)
    average_rating = Column(Float, nullable=True)
    review_count = Column(Integer, default=0)