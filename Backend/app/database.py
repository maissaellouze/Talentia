from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

<<<<<<< Updated upstream
DATABASE_URL = "postgresql://postgres:Hh10833746*+@localhost:5432/internship_platform_db"
=======
DATABASE_URL = "postgresql://postgres:Hh10833746*+@localhost:5432/internship_platform_db" 
#DATABASE_URL="postgresql://postgres:1234@localhost:5432/internship_platform_db"
>>>>>>> Stashed changes

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