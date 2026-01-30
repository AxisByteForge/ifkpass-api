export interface PayCardInput {
  userId: string;
  action: 'generate-checkout' | 'complete-payment';
  paymentStatus?: 'approved' | 'pending' | 'rejected';
  paymentId?: string;
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export type BeltCategory = 'colored' | 'black';

export enum KarateRank {
  BRANCA = 'Branca',
  AMARELA = 'Amarela',
  LARANJA = 'Laranja',
  VERDE = 'Verde',
  AZUL = 'Azul',
  MARROM = 'Marrom',
  PRETA = 'Preta',
  VERMELHA = 'Vermelha'
}

export interface PayCardOutput {
  checkoutUrl?: string;
  message?: string;
}
