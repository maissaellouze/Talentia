import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

BASE_URL = "https://www.emploitunisie.com"

headers = {
    "User-Agent": "Mozilla/5.0"
}

# ===============================
# 1️⃣ Récupération des domaines
# ===============================
print("🔎 Récupération des domaines...")

page = requests.get(f"{BASE_URL}/recherche-jobs-tunisie", headers=headers)
soup = BeautifulSoup(page.content, "html.parser")

domaines = {}

for a in soup.find_all("a", href=True):
    match = re.search(r"im_field_offre_metiers%3A(\d+)", a["href"])
    if match:
        id_metier = match.group(1)
        nom = a.text.strip()

        # Nettoyage
        nom = re.sub(r"Apply.*filter", "", nom)
        nom = re.sub(r"Tunisie", "", nom)
        nom = re.sub(r"\(\d+\)", "", nom)
        nom = nom.strip()

        if nom and nom not in domaines:
            domaines[nom] = id_metier

print(f"✅ {len(domaines)} domaines trouvés\n")

# ===============================
# 2️⃣ Scraping des offres
# ===============================
all_offres = []
liens_deja_vus = set()

for domaine, id_metier in domaines.items():
    print(f"📂 Domaine : {domaine}")

    page_num = 0
    while True:
        url = f"{BASE_URL}/recherche-jobs-tunisie?page={page_num}&f[0]=im_field_offre_metiers:{id_metier}"
        page = requests.get(url, headers=headers)
        soup = BeautifulSoup(page.content, "html.parser")

        jobs = soup.find_all("div", class_="card-job")
        if not jobs:
            break  # plus de pages

        for job in jobs:
            # Lien
            a_tag = job.find("a", href=True)
            if not a_tag:
                continue
            lien = a_tag["href"]
            if not lien.startswith("http"):
                lien = BASE_URL + lien

            if lien in liens_deja_vus:
                continue
            liens_deja_vus.add(lien)

            # -----------------
            # Titre + Région
            # -----------------
            titre_raw = job.find("h3").text.strip() if job.find("h3") else "Non spécifié"
            region = ""
            titre = titre_raw
            if "-" in titre_raw:
                parts = titre_raw.split("-")
                titre = parts[0].strip()
                region = parts[-1].strip()

            # -----------------
            # Page détail
            # -----------------
            detail_page = requests.get(lien, headers=headers)
            detail_soup = BeautifulSoup(detail_page.content, "html.parser")

            # Entreprise
            entreprise = "Non spécifiée"
            bloc_company = detail_soup.select_one("div.card-block-company")
            if bloc_company:
                li_items = bloc_company.find_all("li")
                for li in li_items:
                    if "Entreprise" in li.text:
                        span = li.find("span")
                        if span:
                            entreprise = span.text.strip()

            # Type d'offre
            type_offre = "Non spécifiée"
            if bloc_company:
                for li in bloc_company.find_all("li"):
                    if "Type" in li.text or "Contrat" in li.text:
                        span = li.find("span")
                        if span:
                            type_offre = span.text.strip()
                        break

            # Date publication
            date_pub = "Non spécifiée"

            # Méthode 1 : li avec icône calendrier
            for li in detail_soup.find_all("li"):
                text = li.get_text(strip=True)
                if re.search(r"\d{1,2}\s+\w+\s+\d{4}", text) or re.search(r"\d{1,2}/\d{1,2}/\d{4}", text):
                    date_pub = text
                    break

            # Méthode 2 : recherche globale fallback
            if date_pub == "Non spécifiée":
                match = re.search(r"\d{1,2}\s+\w+\s+\d{4}", detail_soup.text)
                if match:
                    date_pub = match.group()


            # -----------------
            # Ajouter l'offre
            # -----------------
            all_offres.append({
                "Titre": titre,
                "Entreprise": entreprise,
                "Région": region if region else "Non spécifiée",
                "Domaine": domaine,
                "Lien": lien,
                "Date de publication": date_pub,
                "Type d'offre": type_offre
            })

            print("   ✔ Offre ajoutée :", titre)
            time.sleep(0.5)

        page_num += 1
        time.sleep(1)

# ===============================
# 3️⃣ Sauvegarde CSV
# ===============================
df = pd.DataFrame(all_offres)

# Filtres
df_stage = df[df["Type d'offre"].str.contains("Stage", case=False, na=False)]
df_emploi = df[df["Type d'offre"].str.contains("CDI|CDD|Freelance|Temps", case=False, na=False)]

df_stage.to_csv("offres_stage_tunisie.csv", index=False, encoding="utf-8")
df_emploi.to_csv("offres_emploi_tunisie.csv", index=False, encoding="utf-8")

print(f"\n🎉 {len(df_stage)} offres de stage sauvegardées dans offres_stage_tunisie.csv")
print(f"🎉 {len(df_emploi)} offres d'emploi sauvegardées dans offres_emploi_tunisie.csv")
