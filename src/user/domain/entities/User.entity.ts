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

  getProps(): Readonly<UserProps> {
    return Object.freeze({ ...this.props });
  }
}
