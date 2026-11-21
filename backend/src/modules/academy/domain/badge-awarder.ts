import type { Insignia, XpPorMateria } from "./academy.js";

export function selectEarnedBadges(input: {
  badges: Insignia[];
  ownedBadgeIds: Set<number>;
  totalXp: number;
  xpBySubject: XpPorMateria;
}): Insignia[] {
  return input.badges.filter((badge) => {
    const currentXp = badge.materia
      ? input.xpBySubject[badge.materia]
      : input.totalXp;

    return !input.ownedBadgeIds.has(badge.id) && currentXp >= badge.xpRequerido;
  });
}
