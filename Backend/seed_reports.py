import sys
import os

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.pfe_report import PFEReport
from datetime import datetime

MOCK_REPORTS = [
  { "title": "Système de recommandation d'emploi basé sur le Deep Learning", "domain": "IA", "author": "Ahmed Ben Ali", "year": "2024", "university": "ESPRIT", "views": 342, "description": "Ce projet explore l'utilisation des réseaux de neurones profonds pour personnaliser les recommandations d'offres d'emploi selon le profil du candidat. Le système atteint un taux de pertinence de 87% sur les données de test." },
  { "title": "Plateforme e-commerce avec microservices React & Node.js", "domain": "Web", "author": "Sarra Trabelsi", "year": "2024", "university": "INSAT", "views": 215, "description": "Conception et développement d'une architecture microservices pour une plateforme e-commerce moderne. Chaque service est indépendant, dockerisé et communique via une API Gateway avec gestion de cache Redis." },
  { "title": "Application mobile de suivi médical avec Flutter", "domain": "Mobile", "author": "Mohamed Chaabani", "year": "2023", "university": "FST", "views": 189, "description": "Application cross-platform permettant aux patients de suivre leurs indicateurs de santé (tension, glycémie, poids) et d'envoyer des alertes automatiques à leur médecin en cas d'anomalie détectée." },
  { "title": "Détection d'anomalies réseau par apprentissage automatique", "domain": "IA", "author": "Ines Hamdi", "year": "2023", "university": "ESPRIT", "views": 410, "description": "Système de cybersécurité basé sur des algorithmes de clustering (K-Means, DBSCAN) et de classification (Random Forest) pour détecter en temps réel les intrusions et anomalies dans le trafic réseau." },
  { "title": "Digitalisation des processus RH : ERP sur mesure", "domain": "Web", "author": "Youssef Khelil", "year": "2023", "university": "ISET", "views": 98, "description": "Développement d'un module ERP complet pour la gestion des ressources humaines intégrant : recrutement, paie, congés, évaluations de performances et tableaux de bord analytiques." },
  { "title": "Chatbot intelligent pour le support client bancaire", "domain": "IA", "author": "Rania Meddeb", "year": "2024", "university": "INSAT", "views": 276, "description": "Chatbot NLP basé sur BERT fine-tuné sur des données bancaires tunisiennes. Le système gère les demandes de solde, virements, réclamations et escalade automatiquement vers un agent humain si nécessaire." },
  { "title": "Système de gestion de bibliothèque universitaire", "domain": "Web", "author": "Nour Belhaj", "year": "2022", "university": "FST", "views": 134, "description": "Refonte complète du système de gestion de bibliothèque avec une interface web moderne, gestion des emprunts/retours, notifications automatiques et recherche full-text dans le catalogue en ligne." },
  { "title": "Application IoT pour la gestion d'énergie intelligente", "domain": "IoT", "author": "Bilel Mansouri", "year": "2024", "university": "ENIT", "views": 305, "description": "Réseau de capteurs ESP32 connectés au cloud via MQTT, avec un dashboard temps réel affichant la consommation électrique par pièce et des recommandations d'optimisation générées par IA." },
  { "title": "Plateforme d'apprentissage en ligne avec IA adaptative", "domain": "IA", "author": "Malek Zaidi", "year": "2023", "university": "ESPRIT", "views": 488, "description": "LMS intelligent qui adapte le contenu pédagogique et le rythme d'apprentissage à chaque étudiant grâce à un moteur de recommandation basé sur la théorie de la réponse aux items (IRT) et des modèles de connaissance bayésiens." },
]

def seed():
    db: Session = SessionLocal()
    try:
        print("🔍 Seeding PFE Reports...")
        for report in MOCK_REPORTS:
            # Check if it already exists to avoid duplicates
            exists = db.query(PFEReport).filter(PFEReport.title == report["title"]).first()
            if not exists:
                db_report = PFEReport(
                    **report,
                    file_url="/uploads/mock_report.pdf", # Placeholder
                    content_text=report["description"], # Simplification
                    embedding=None, # will need search index to be rebuilt if and when
                    created_at=datetime.utcnow()
                )
                db.add(db_report)
                print(f"  ✅ Added: {report['title']}")
        
        db.commit()
        print("🎉 Seeding complete.")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
