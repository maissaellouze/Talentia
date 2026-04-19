from fastapi import APIRouter, Body, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List

# Importations internes
from app.models.recommendation import RecommendationRequest
from app.database import get_db
from app.models.user import User
from app.models.teacher import Teacher
from app.models.ProjectIdea import ProjectIdea
from app.routers.auth import get_current_user
from sqlalchemy.orm import Session, joinedload  
router = APIRouter(prefix="/teachers", tags=["Enseignant Dashboard"])

# ─── 1. RÉCUPÉRER LA LISTE DES PROJETS REÇUS ───
@router.get("/received-project-ideas", status_code=status.HTTP_200_OK)
def get_received_ideas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Liste tous les projets envoyés à l'enseignant connecté.
    Inclut les informations de l'étudiant expéditeur.
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Accès réservé aux enseignants."
        )

    # Récupérer le profil Teacher lié à l'utilisateur
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Profil enseignant introuvable.")

    # Import local pour éviter le circular import au niveau module
    from app.models.student import Student as StudentModel

    # Récupérer les idées avec les relations chargées explicitement
    ideas = (
        db.query(ProjectIdea)
        .options(
            joinedload(ProjectIdea.student).joinedload(StudentModel.user)
        )
        .filter(ProjectIdea.teacher_id == teacher.id)
        .all()
    )

    return [
        {
            "id": idea.id,
            "title": idea.title,
            "description": idea.description,
            "technologies": idea.technologies,
            "difficulty_level": idea.difficulty_level,
            "status": idea.status,
            "feedback": idea.feedback,  # L'excuse ou le commentaire
            "created_at": idea.created_at,
            "pdf_filename": idea.pdf_filename,
            "student_info": (
                {
                    "id": idea.student.id,
                    "full_name": f"{idea.student.first_name or ''} {idea.student.last_name or ''}".strip() or "Étudiant",
                    "email": idea.student.user.email if idea.student.user else "—"
                }
                if idea.student else None
            )
        } for idea in ideas
    ]

# ─── 2. ACCEPTER OU REFUSER UN PROJET (AVEC FEEDBACK) ───
@router.patch("/review-project-idea/{idea_id}")
def review_project_idea(
    idea_id: int,
    action: str = Body(..., embed=True),    # Doit être "accept" ou "refuse"
    feedback: str = Body(None, embed=True), # Message obligatoire si refusé
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permet de valider ou rejeter un projet. 
    Si refusé, un feedback (excuse) est obligatoire.
    """
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Action non autorisée.")

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    
    # Sécurité : On vérifie que le projet existe ET qu'il appartient bien à ce prof
    idea = db.query(ProjectIdea).filter(
        ProjectIdea.id == idea_id, 
        ProjectIdea.teacher_id == teacher.id
    ).first()

    if not idea:
        raise HTTPException(status_code=404, detail="Projet introuvable ou non assigné.")

    if action == "accept":
        idea.status = "approved"
        idea.feedback = feedback if feedback else "Projet validé."
        message = "Le projet a été accepté."
        
    elif action == "refuse":
        # On force l'enseignant à donner une raison s'il refuse
        if not feedback or len(feedback.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Veuillez fournir un motif de refus (minimum 5 caractères)."
            )
        idea.status = "rejected"
        idea.feedback = feedback
        message = "Le projet a été refusé avec succès."
        
    else:
        raise HTTPException(status_code=400, detail="Action invalide. Utilisez 'accept' ou 'refuse'.")

    try:
        db.commit()
        return {"message": message, "new_status": idea.status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur technique : {str(e)}")

# ─── 3. TÉLÉCHARGER LE PDF DU PROJET ───
@router.get("/download-pdf/{idea_id}")
def download_project_file(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permet à l'enseignant de télécharger le cahier des charges envoyé par l'étudiant.
    """
    if current_user.role != "teacher":
        raise HTTPException(status_code=403)

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    
    idea = db.query(ProjectIdea).filter(
        ProjectIdea.id == idea_id, 
        ProjectIdea.teacher_id == teacher.id
    ).first()

    if not idea or not idea.specifications_pdf:
        raise HTTPException(status_code=404, detail="Aucun fichier PDF disponible pour ce projet.")

    return Response(
        content=idea.specifications_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={idea.pdf_filename}"}
    )


@router.get("/recommendation-requests")
def get_recommendation_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    requests = db.query(RecommendationRequest).filter(RecommendationRequest.teacher_id == teacher.id).all()
    
    return [{
        "id": r.id,
        "student_name": f"{r.student.first_name} {r.student.last_name}",
        "purpose": r.purpose,
        "status": r.status,
        "created_at": r.created_at
    } for r in requests]


@router.patch("/write-recommendation/{request_id}")
def write_recommendation(
    request_id: int,
    letter_content: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    request = db.query(RecommendationRequest).filter(
        RecommendationRequest.id == request_id, 
        RecommendationRequest.teacher_id == teacher.id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Demande non trouvée.")

    request.content = letter_content
    request.status = "completed"
    db.commit()
    
    return {"message": "Lettre de recommandation envoyée à l'étudiant."}


@router.patch("/refuse-recommendation/{request_id}")
async def refuse_recommendation(
    request_id: int, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user) # Optionnel: ajouter sécurité
):
    # 1. Chercher la demande dans la base de données
    db_request = db.query(RecommendationRequest).filter(RecommendationRequest.id == request_id).first()
    
    if not db_request:
        raise HTTPException(status_code=404, detail="Demande de recommandation non trouvée")

    # 2. Mettre à jour le statut
    db_request.status = "refused"  # ou "rejected" selon votre nomenclature
    
    try:
        db.commit()
        return {"status": "success", "message": "La demande a été refusée"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")