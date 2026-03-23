from pydantic import BaseModel


class PFEResponse(BaseModel):
    id: int
    title: str
    domain: str
    file_url: str

    class Config:
        orm_mode = True