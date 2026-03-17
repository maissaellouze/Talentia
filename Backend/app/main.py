import fastapi
from app.database import engine, Base

from app.models import user
from app.models import student
from app.models import company
from app.models import experience
from app.models import skill

from app.routers import auth

app = fastapi.FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)