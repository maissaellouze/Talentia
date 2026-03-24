from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.company import Societe as Company
from app.models.user import User
from app.utils.security import hash_password
import secrets
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/admin", tags=["Admin"])

# Config email (Reuse from auth or move to config)
SMTP_HOST     = "smtp.gmail.com"
SMTP_PORT     = 587
SMTP_EMAIL    = "maissaellouze02@gmail.com"
SMTP_PASSWORD = "hood qlfc ummf vcka"

def send_verification_email(to_email: str, company_name: str, password: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Votre entreprise est vérifiée sur TalentIA 🎉"
    msg["From"]    = SMTP_EMAIL
    msg["To"]      = to_email
    
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#0d9488;">Félicitations {company_name} !</h2>

      <p style="color:#6b7280;font-size:14px;">
        Votre entreprise a été vérifiée avec succès.
      </p>

      <div style="background:#f0fdfa;padding:16px;border-radius:10px;margin-top:20px;">
        <p><strong>Email:</strong> {to_email}</p>
        <p><strong>Mot de passe:</strong> {password}</p>
      </div>

      <p style="font-size:12px;color:#6b7280;">
        ⚠️ Changez votre mot de passe après connexion.
      </p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

@router.get("/pending-companies")
def get_pending_companies(db: Session = Depends(get_db)):
    return db.query(Company).filter(Company.is_verified == False).all()

@router.post("/companies/{company_id}/verify")
def verify_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")

    alphabet = string.ascii_letters + string.digits
    temp_password = ''.join(secrets.choice(alphabet) for _ in range(10))
    

    company.password = hash_password(temp_password)
    company.is_verified = True
    company.status = "verified"

    db.commit()

    try:
        send_verification_email(company.email, company.name, temp_password)
        return {"message": "Entreprise vérifiée + email envoyé"}
    except Exception as e:
        print("EMAIL ERROR:", e)
        return {
            "message": "Entreprise vérifiée MAIS email échoué",
            "temp_password": temp_password
        }

@router.post("/companies/{company_id}/reject")
def reject_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    db.delete(company)
    db.commit()
    
    return {"message": "Demande rejetée et entreprise supprimée."}

