export const CV_DATA = {
  // Champs Student (diagramme de classe)
  firstName:      'Ahmed',
  lastName:       'Ben Ali',
  email:          'ahmed.benali@etudiant.tn',
  phone:          '+216 55 234 891',
  dateOfBirth:    '2001-06-15',
  city:           'Tunis',
  address:        'Rue de la Liberté, El Menzah',
  profilePicture: '',

  // Profil académique
  niveau:    'Master 2',
  filiere:   'Informatique',
  universite: "ESPRIT — École Supérieure Privée d'Ingénierie",

  // Expériences avec dates (pour calcul durée en mois)
  experiences: [
    { poste: 'Développeur React',  entreprise: 'Vermeg',    debut: '2023-02', fin: '2024-01' },
    { poste: 'Stage Node.js',      entreprise: 'Sofrecom',  debut: '2022-07', fin: '2022-12' },
  ],

  // Compétences
  skills: ['React.js', 'Node.js', 'Python', 'Spring Boot', 'MySQL', 'Docker'],
  skillLevels: { 'React.js': 4, 'Python': 3, 'Node.js': 4, 'Docker': 2, 'MySQL': 3, 'Spring Boot': 2 },

  // Langues
  langues: [
    { nom: 'Français', niveau: 'Courant'        },
    { nom: 'Anglais',  niveau: 'Intermédiaire'  },
    { nom: 'Arabe',    niveau: 'Natif'          },
  ],
};

export const JOBS_DEMO = [
  { ico: '🏦', title: 'Développeur Full Stack', company: 'Vermeg · Tunis',    match: 98, high: true  },
  { ico: '🛒', title: 'Stage React / Node.js',  company: 'Jumia · Tunis',     match: 95, high: true  },
  { ico: '📊', title: 'Data Engineer Intern',   company: 'Sofrecom · Tunis',  match: 87, high: false },
];

export const TESTIMONIALS = [
  { q: '"En 30 secondes mon profil était complet. Stage décroché chez Vermeg en une semaine !"', av: 'SA', name: 'Sarra Ayari',   role: 'Master 2 Informatique · ESPRIT', color: '#0d9488' },
  { q: '"Les offres correspondaient exactement à mes compétences React et Node.js."',            av: 'MA', name: 'Mohamed Aziz', role: 'Ingénieur Génie Logiciel · FST',  color: '#f97316' },
  { q: '"L\'IA a détecté des compétences oubliées. 3 offres CDI reçues en une semaine."',        av: 'LB', name: 'Lina Brahmi',  role: 'Data Analyst · ISG Tunis',        color: '#0369a1' },
];

export const FEATURES = [
  { ico: '🤖', title: 'Analyse IA du CV',      desc: 'Extraction automatique de toutes vos informations en quelques secondes.', bg: '#f0fdfa' },
  { ico: '🎯', title: 'Matching intelligent',  desc: 'Score de compatibilité calculé pour chaque offre selon votre profil.',    bg: '#eff6ff' },
  { ico: '🔔', title: 'Alertes en temps réel', desc: 'Notifications dès qu\'une offre correspond à votre profil.',              bg: '#fff7ed' },
  { ico: '📊', title: 'Tableau de bord',       desc: 'Gérez candidatures et sauvegardes depuis un espace unifié.',              bg: '#f0fdf4' },
  { ico: '🌐', title: 'Recherche avancée',     desc: 'Filtrez par ville, contrat, secteur et niveau d\'expérience.',            bg: '#fef3c7' },
  { ico: '🏢', title: 'Profils entreprises',   desc: 'Culture et avis sur les entreprises qui recrutent près de vous.',         bg: '#f0fdfa' },
];
