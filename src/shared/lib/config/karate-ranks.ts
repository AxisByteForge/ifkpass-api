export const KARATE_RANKS = [
  'Branca',
  'Amarela',
  'Laranja',
  'Verde',
  'Azul',
  'Marrom',
  'Preta',
  'Vermelha'
] as const;

export type KarateRank = (typeof KARATE_RANKS)[number];
export type BeltCategory = 'colored' | 'black';
