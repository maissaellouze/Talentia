from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import sessionmaker

#DATABASE_URL = "postgresql://postgres:Hh10833746*+@localhost:5432/internship_platform_db" mta3 hiba
DATABASE_URL="postgresql://postgres:mayssam@localhost:5432/internship_platform_db"

engine = create_engine(DATABASE_URL,connect_args={"client_encoding": "utf8"})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()