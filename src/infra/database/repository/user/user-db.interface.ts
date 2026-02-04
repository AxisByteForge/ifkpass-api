export interface UserDbData {
  id: string;
  name: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  birthDate?: string;
  city?: string;
  cpf?: string;
  phone?: string;
  dojo?: string;
  rank?: string;
  sensei?: string;
  photoUrl?: string;
  cardId?: string;
  paymentDetails?: {
    alreadyPaid: boolean;
    status: string;
    preferenceId?: string;
    paymentId?: string;
    amount?: number;
    currency?: string;
    discountApplied?: boolean;
    beltCategory?: string;
    rank?: string;
    updatedAt: string;
  };
}
