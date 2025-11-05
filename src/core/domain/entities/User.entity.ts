import { randomUUID } from 'node:crypto';

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface UserProps {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  status: UserStatus;
  // Profile properties (optional)
  birthDate?: string;
  city?: string;
  cpf?: string;
  dojo?: string;
  rank?: string;
  sensei?: string;
  photoUrl?: string;
  cardId?: string;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'userId' | 'status'>,
  ): User {
    const now = new Date().toISOString();
    const userId = randomUUID();

    return new User({
      ...props,
      userId,
      createdAt: now,
      updatedAt: now,
      status: UserStatus.PENDING,
    });
  }

  static fromPersistence(props: {
    userId: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    status?: string;
    birthDate?: string;
    city?: string;
    cpf?: string;
    dojo?: string;
    rank?: string;
    sensei?: string;
    photoUrl?: string;
    cardId?: string;
  }): User {
    return new User({
      ...props,
      email: props.email,
      status: (props.status as UserStatus) || UserStatus.PENDING,
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
    return this.props.userId;
  }

  getFullName(): string {
    return `${this.props.name} ${this.props.lastName}`;
  }

  getStatus(): UserStatus {
    return this.props.status;
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
    rank: string;
    sensei: string;
    photoUrl: string;
  }): void {
    const cardId = User.generateCardId();
    this.props = {
      ...this.props,
      ...profileData,
      cardId,
      updatedAt: new Date().toISOString(),
    };
  }

  updateProfile(
    update: Partial<{
      birthDate: string;
      city: string;
      cpf: string;
      dojo: string;
      rank: string;
      sensei: string;
      photoUrl: string;
    }>,
  ): void {
    this.props = {
      ...this.props,
      ...update,
      updatedAt: new Date().toISOString(),
    };
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
