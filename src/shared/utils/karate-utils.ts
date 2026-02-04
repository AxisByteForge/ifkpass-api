import { randomUUID } from 'node:crypto';
import {
  KARATE_RANKS,
  type BeltCategory
} from '@/shared/lib/config/karate-ranks';

export function normalizeRank(rank?: string): string | undefined {
  if (!rank) return undefined;
  const value = rank
    .trim()
    .toLowerCase()
    .replace(/^faixa\s+/, '');
  const match = KARATE_RANKS.find((item) => item.toLowerCase() === value);
  return match;
}

export function beltCategoryFromRank(rank?: string): BeltCategory {
  return rank === 'Preta' ? 'black' : 'colored';
}

export function generateCardId(): string {
  const year = new Date().getFullYear();
  const uuid = randomUUID();
  return `KTY-${year}-${uuid}`;
}
