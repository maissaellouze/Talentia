from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import numpy as np

# Initialize the pre-trained sentence transformer model once (cached globally)
_semantic_model = None

def _get_semantic_model() -> SentenceTransformer:
    """
    Lazy load the semantic model to avoid reloading on every function call.
    Uses the pre-trained 'all-MiniLM-L6-v2' model for fast semantic similarity.
    """
    global _semantic_model
    if _semantic_model is None:
        _semantic_model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder='../model_cache')
    return _semantic_model


def _compute_semantic_similarity(text1: str, text2: str, threshold: float = 0.65) -> float:
    """
    Computes semantic similarity between two texts using sentence embeddings.
    Handles abbreviations, synonyms, and related terms intelligently.
    
    Args:
        text1: First text to compare
        text2: Second text to compare
        threshold: Minimum similarity score to consider a match (0-1)
    
    Returns:
        Similarity score between 0 and 1
    """
    try:
        model = _get_semantic_model()
        embeddings = model.encode([text1.lower(), text2.lower()], convert_to_tensor=False)
        # Compute cosine similarity
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        return max(0, float(similarity))
    except Exception as e:
        print(f"Error in semantic similarity: {e}")
        return 0.0


def _match_skills_semantically(required_skills: List[str], student_skills: List[str], threshold: float = 0.65) -> tuple:
    """
    Matches skills using semantic similarity instead of exact string matching.
    Understands abbreviations (CS=Computer Science), synonyms (engineer=developer), and variations.
    
    Args:
        required_skills: List of skills required by the company
        student_skills: List of skills the student possesses
        threshold: Minimum similarity threshold for a match
    
    Returns:
        Tuple of (match_count, total_required)
    """
    matches = 0
    
    for required_skill in required_skills:
        for student_skill in student_skills:
            similarity = _compute_semantic_similarity(required_skill, student_skill, threshold)
            if similarity >= threshold:
                matches += 1
                break
    
    return matches, len(required_skills)


def _match_experience_semantically(internship_title: str, internship_description: str, experiences: List[Dict[str, str]], threshold: float = 0.60) -> int:
    """
    Matches experience using semantic similarity.
    Intelligent matching for roles, descriptions, and related terms.
    
    Args:
        internship_title: Title of the internship position
        internship_description: Description of the internship
        experiences: List of student experiences
        threshold: Minimum similarity threshold
    
    Returns:
        Experience score (0-30 range)
    """
    max_match_score = 0
    
    for exp in experiences:
        role_similarity = _compute_semantic_similarity(internship_title, exp.get('role', ''), threshold)
        desc_similarity = _compute_semantic_similarity(internship_title, exp.get('description', ''), threshold)
        
        best_score = max(role_similarity, desc_similarity)
        if best_score >= threshold:
            max_match_score = 30
            return max_match_score
        
        # Partial credit for related experience even if not exact match
        if best_score >= (threshold - 0.15):
            max_match_score = max(max_match_score, 15)
    
    # Base score for having experience even if no semantic match
    if not max_match_score and experiences:
        max_match_score = min(len(experiences) * 10, 20)
    
    return max_match_score


def _match_sector_semantically(internship_sector: str, preferred_sectors: str, threshold: float = 0.65) -> bool:
    """
    Matches sector preferences using semantic similarity.
    
    Args:
        internship_sector: Sector of the internship
        preferred_sectors: Comma-separated preferred sectors from student
        threshold: Minimum similarity threshold
    
    Returns:
        Boolean indicating if there's a semantic match
    """
    if not preferred_sectors:
        return False
    
    preferred_list = [s.strip() for s in preferred_sectors.split(',')]
    
    for pref_sector in preferred_list:
        similarity = _compute_semantic_similarity(internship_sector, pref_sector, threshold)
        if similarity >= threshold:
            return True
    
    return False


def calculate_match_score(student_data, internship):
    """
    Calculates a weighted match score based on the full student profile using semantic similarity.
    Weights: Technical Skills (40%), Experience (30%), Education/Languages (20%), Preferences (10%).
    
    Intelligently understands:
    - Skill abbreviations (CS=Computer Science, JS=JavaScript, ReactJS=React)
    - Equivalent terms (Software Engineer=Developer, IT=Computer Science)
    - Related technologies and domains
    - Does NOT reject matches just for minor naming variations
    """
    
    # 1. Technical Skills Match (40%)
    # Pulls from skill.py - Uses semantic similarity for intelligent matching
    tech_score = 0
    required = []
    
    if hasattr(internship, 'requirements') and internship.requirements:
        required = [r.description.strip() for r in internship.requirements if hasattr(r, 'description')]
    elif hasattr(internship, 'required_skills') and internship.required_skills:
        required = [s.strip() for s in internship.required_skills.split(",")]
        
    if required:
        student_tech = [s.name for s in student_data.get('skills', [])]
        
        matches, total = _match_skills_semantically(required, student_tech, threshold=0.65)
        tech_score = (matches / total) * 40 if total > 0 else 0

    # 2. Experience & Role Match (30%)
    # Pulls from experience.py - Uses semantic similarity for intelligent matching
    exp_score = 0
    if student_data.get('experiences'):
        experiences_data = [
            {
                'role': exp.role if hasattr(exp, 'role') else '',
                'description': exp.description if hasattr(exp, 'description') else ''
            }
            for exp in student_data['experiences']
        ]
        exp_score = _match_experience_semantically(
            internship.title,
            internship.description if hasattr(internship, 'description') else '',
            experiences_data,
            threshold=0.60
        )

    # 3. Education, Soft Skills & Languages (20%)
    # Pulls from education.py, soft_skill.py, and language.py
    edu_lang_score = 0
    if student_data.get('education'): edu_lang_score += 10
    if student_data.get('languages'): edu_lang_score += 5
    if student_data.get('soft_skills'): edu_lang_score += 5

    # 4. Preferences Match (10%)
    # Pulls from preference.py - Uses semantic similarity for sector matching
    pref_score = 0
    if student_data.get('preferences'):
        pref = student_data['preferences']
        preferred_sectors = pref.sectors if hasattr(pref, 'sectors') else ''
        
        internship_sector = getattr(internship, 'sector', '')
        if internship_sector and _match_sector_semantically(internship_sector, preferred_sectors, threshold=0.65):
            pref_score = 10

    total_score = tech_score + exp_score + edu_lang_score + pref_score
    return round(min(total_score, 100), 2)