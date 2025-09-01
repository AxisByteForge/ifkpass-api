import { randomUUID } from 'node:crypto';

export interface UserProps {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'userId'>,
  ): User {
    const now = new Date().toISOString();
    const userId = randomUUID();

    return new User({
      ...props,
      userId,
      createdAt: now,
      updatedAt: now,
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
  }): User {
    return new User({
      ...props,
      email: props.email,
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

  getProps(): Readonly<UserProps> {
    return Object.freeze({ ...this.props });
  }
}
