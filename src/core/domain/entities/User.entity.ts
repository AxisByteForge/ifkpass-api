import { randomUUID } from 'node:crypto';

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum KarateRank {
  BRANCA = 'Branca',
  AMARELA = 'Amarela',
  LARANJA = 'Laranja',
  VERDE = 'Verde',
  AZUL = 'Azul',
  MARROM = 'Marrom',
  PRETA = 'Preta',
  VERMELHA = 'Vermelha',
}

export type BeltCategory = 'colored' | 'black';

export type PaymentStatus = 'approved' | 'pending' | 'rejected';

export interface PaymentDetails {
  alreadyPaid: boolean;
  status: PaymentStatus;
  preferenceId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  discountApplied?: boolean;
  beltCategory?: BeltCategory;
  rank?: KarateRank;
  updatedAt: string;
}

const KARATE_RANK_VALUES = Object.values(KarateRank);

export interface UserProps {
  Id: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  status: UserStatus;
  isAdmin: boolean;
  paymentDetails?: PaymentDetails;
  // Profile properties (optional)
  birthDate?: string;
  city?: string;
  cpf?: string;
  dojo?: string;
  rank?: KarateRank;
  sensei?: string;
  photoUrl?: string;
  cardId?: string;
}

export class User {
  private props: UserProps;

  private static normalizeRank(
    rank?: string | KarateRank,
  ): KarateRank | undefined {
    if (!rank) return undefined;
    const value = `${rank}`
      .trim()
      .toLowerCase()
      .replace(/^faixa\s+/, '');
    const match = KARATE_RANK_VALUES.find(
      (item) => item.toLowerCase() === value,
    );
    return match as KarateRank | undefined;
  }

  private static beltCategoryFromRank(rank?: KarateRank): BeltCategory {
    return rank === KarateRank.PRETA ? 'black' : 'colored';
  }

  private static normalizePaymentDetails(
    details?: Partial<PaymentDetails> | null,
  ): PaymentDetails | undefined {
    if (!details) return undefined;
    const normalizedRank = User.normalizeRank(details.rank);
    return {
      alreadyPaid: details.alreadyPaid ?? false,
      status: details.status ?? 'pending',
      preferenceId: details.preferenceId,
      paymentId: details.paymentId,
      amount: details.amount,
      currency: details.currency,
      discountApplied: details.discountApplied,
      beltCategory:
        details.beltCategory ?? User.beltCategoryFromRank(normalizedRank),
      rank: normalizedRank,
      updatedAt: details.updatedAt ?? new Date().toISOString(),
    };
  }

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'Id' | 'status'> & {
      isAdmin?: boolean;
      paymentDetails?: PaymentDetails;
    },
  ): User {
    const now = new Date().toISOString();
    const Id = randomUUID();
    const { rank, paymentDetails, ...rest } = props;
    const normalizedRank = User.normalizeRank(rank);
    const normalizedPaymentDetails =
      User.normalizePaymentDetails(paymentDetails) ??
      (props.isAdmin
        ? {
            alreadyPaid: true,
            status: 'approved' as PaymentStatus,
            beltCategory: User.beltCategoryFromRank(normalizedRank),
            rank: normalizedRank,
            updatedAt: now,
          }
        : {
            alreadyPaid: false,
            status: 'pending' as PaymentStatus,
            beltCategory: User.beltCategoryFromRank(normalizedRank),
            rank: normalizedRank,
            updatedAt: now,
          });

    return new User({
      ...rest,
      Id,
      createdAt: now,
      updatedAt: now,
      status: props.isAdmin === true ? UserStatus.APPROVED : UserStatus.PENDING,
      isAdmin: props.isAdmin ?? false,
      rank: normalizedRank,
      paymentDetails: normalizedPaymentDetails,
    });
  }

  static fromPersistence(props: {
    Id: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    status?: string;
    isAdmin?: boolean;
    birthDate?: string;
    city?: string;
    cpf?: string;
    dojo?: string;
    rank?: KarateRank | string;
    sensei?: string;
    photoUrl?: string;
    cardId?: string;
    paymentDetails?: PaymentDetails;
  }): User {
    const { rank, paymentDetails, ...rest } = props;
    const normalizedRank = User.normalizeRank(rank);
    return new User({
      ...rest,
      email: props.email,
      status: (props.status as UserStatus) || UserStatus.PENDING,
      isAdmin: props.isAdmin ?? false,
      rank: normalizedRank,
      paymentDetails:
        User.normalizePaymentDetails(paymentDetails) ??
        (props.isAdmin
          ? {
              alreadyPaid: true,
              status: 'approved',
              beltCategory: User.beltCategoryFromRank(normalizedRank),
              rank: normalizedRank,
              updatedAt: props.updatedAt,
            }
          : undefined),
    });
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  getEmail(): string {
    return this.props.email;
  }

  getId(): string {
    return this.props.Id;
  }

  getFullName(): string {
    return `${this.props.name} ${this.props.lastName}`;
  }

  getStatus(): UserStatus {
    return this.props.status;
  }

  isAdmin(): boolean {
    return this.props.isAdmin;
  }

  hasAlreadyPaid(): boolean {
    return this.props.paymentDetails?.alreadyPaid ?? false;
  }

  getPaymentDetails(): PaymentDetails | undefined {
    return this.props.paymentDetails
      ? { ...this.props.paymentDetails }
      : undefined;
  }

  updatePaymentDetails(details: Partial<PaymentDetails>): void {
    const now = new Date().toISOString();
    let current = this.props.paymentDetails;

    if (!current) {
      current = {
        alreadyPaid: false,
        status: 'pending' as PaymentStatus,
        rank: this.props.rank,
        beltCategory: User.beltCategoryFromRank(this.props.rank),
        updatedAt: now,
      };
    }

    const normalizedRank =
      details.rank !== undefined
        ? User.normalizeRank(details.rank)
        : (current.rank ?? this.props.rank);

    const beltCategory =
      details.beltCategory ??
      current.beltCategory ??
      User.beltCategoryFromRank(normalizedRank ?? this.props.rank);

    this.props = {
      ...this.props,
      ...(normalizedRank !== undefined ? { rank: normalizedRank } : {}),
      paymentDetails: {
        ...current,
        ...details,
        rank: normalizedRank ?? current.rank,
        beltCategory,
        alreadyPaid: details.alreadyPaid ?? current.alreadyPaid ?? false,
        status: details.status ?? current.status ?? 'pending',
        updatedAt: now,
      },
      updatedAt: now,
    };
  }

  updateStatus(status: UserStatus): void {
    this.props = {
      ...this.props,
      status,
      updatedAt: new Date().toISOString(),
    };
  }

  createProfile(profileData: {
    birthDate: string;
    city: string;
    cpf: string;
    dojo: string;
    rank: KarateRank;
    sensei: string;
    photoUrl: string;
  }): void {
    const { rank, ...rest } = profileData;
    const normalizedRank = User.normalizeRank(rank);
    const cardId = User.generateCardId();
    this.props = {
      ...this.props,
      ...rest,
      ...(normalizedRank !== undefined ? { rank: normalizedRank } : {}),
      cardId,
      updatedAt: new Date().toISOString(),
    };

    if (rank !== undefined) {
      const details: Partial<PaymentDetails> = {
        rank: normalizedRank,
      };
      if (normalizedRank !== undefined) {
        details.beltCategory = User.beltCategoryFromRank(normalizedRank);
      }
      this.updatePaymentDetails(details);
    }
  }

  updateProfile(
    update: Partial<{
      birthDate: string;
      city: string;
      cpf: string;
      dojo: string;
      rank: KarateRank;
      sensei: string;
      photoUrl: string;
    }>,
  ): void {
    const { rank, ...rest } = update;
    const now = new Date().toISOString();
    const normalizedRank =
      rank !== undefined ? User.normalizeRank(rank) : undefined;

    this.props = {
      ...this.props,
      ...rest,
      ...(normalizedRank !== undefined ? { rank: normalizedRank } : {}),
      updatedAt: now,
    };

    if (rank !== undefined) {
      const details: Partial<PaymentDetails> = {
        rank: normalizedRank,
      };
      if (normalizedRank !== undefined) {
        details.beltCategory = User.beltCategoryFromRank(normalizedRank);
      }
      this.updatePaymentDetails(details);
    }
  }

  static generateCardId(): string {
    const year = new Date().getFullYear();
    const uuid = randomUUID();
    return `KTY-${year}-${uuid}`;
  }

  getCardId(): string | undefined {
    return this.props.cardId;
  }

  getCpf(): string | undefined {
    return this.props.cpf;
  }

  getProps(): Readonly<UserProps> {
    return Object.freeze({ ...this.props });
  }
}
