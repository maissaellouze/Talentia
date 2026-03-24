def calculate_match_score(student_data, internship):
    """
    Calculates a weighted match score based on the full student profile.
    Weights: Technical Skills (40%), Experience (30%), Education/Languages (20%), Preferences (10%).
    """
    # 1. Technical Skills Match (40%)
    # Pulls from skill.py
    tech_score = 0
    if internship.required_skills:
        required = set([s.strip().lower() for s in internship.required_skills.split(",")])
        student_tech = set([s.name.lower() for s in student_data['skills']])
        tech_matches = required.intersection(student_tech)
        tech_score = (len(tech_matches) / len(required)) * 40 if required else 0

    # 2. Experience & Role Match (30%)
    # Pulls from experience.py
    exp_score = 0
    if student_data['experiences']:
        for exp in student_data['experiences']:
            # Check if previous roles or descriptions match the internship title
            if internship.title.lower() in exp.role.lower() or internship.title.lower() in exp.description.lower():
                exp_score = 30
                break
        if exp_score == 0: # Base score for having any experience
            exp_score = min(len(student_data['experiences']) * 10, 20)

    # 3. Education, Soft Skills & Languages (20%)
    # Pulls from education.py, soft_skill.py, and language.py
    edu_lang_score = 0
    if student_data['education']: edu_lang_score += 10
    if student_data['languages']: edu_lang_score += 5
    if student_data['soft_skills']: edu_lang_score += 5

    # 4. Preferences Match (10%)
    # Pulls from preference.py
    pref_score = 0
    if student_data['preferences']:
        pref = student_data['preferences']
        # Check if the internship sector is in student's preferred sectors
        if internship.sector.lower() in pref.sectors.lower():
            pref_score = 10

    total_score = tech_score + exp_score + edu_lang_score + pref_score
    return round(min(total_score, 100), 2)