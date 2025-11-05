import { randomUUID } from 'node:crypto';

export interface AdminProps {
  adminId: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export class Admin {
  private props: AdminProps;

  private constructor(props: AdminProps) {
    this.props = props;
  }

  static create(props: Omit<AdminProps, 'adminId' | 'createdAt'>): Admin {
    const now = new Date().toISOString();
    const adminId = randomUUID();

    return new Admin({
      ...props,
      adminId,
      createdAt: now,
    });
  }

  static fromPersistence(props: {
    adminId: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
  }): Admin {
    return new Admin({
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
    return this.props.adminId;
  }

  getFullName(): string {
    return `${this.props.name} ${this.props.lastName}`;
  }

  getProps(): Readonly<AdminProps> {
    return Object.freeze({ ...this.props });
  }
}
