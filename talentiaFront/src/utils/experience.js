/**
 * Calcule la durée totale d'expérience en mois
 * à partir d'un tableau d'expériences {debut: 'YYYY-MM', fin: 'YYYY-MM' | 'present'}
 */
export function calcExpMois(experiences = []) {
  return experiences.reduce((total, exp) => {
    const [ay, am] = exp.debut.split('-').map(Number);
    const finDate = exp.fin === 'present'
      ? new Date()
      : new Date(exp.fin + '-01');
    const debDate = new Date(ay, am - 1, 1);
    const mois = (finDate.getFullYear() - debDate.getFullYear()) * 12
               + (finDate.getMonth() - debDate.getMonth());
    return total + Math.max(0, mois);
  }, 0);
}

/**
 * Formate un nombre de mois en texte lisible
 * ex: 18 → "1 an 6 mois"
 */
export function formatMois(m) {
  const ans  = Math.floor(m / 12);
  const rest = m % 12;
  if (!ans)  return `${rest} mois`;
  if (!rest) return `${ans} an${ans > 1 ? 's' : ''}`;
  return `${ans} an${ans > 1 ? 's' : ''} ${rest} mois`;
}
