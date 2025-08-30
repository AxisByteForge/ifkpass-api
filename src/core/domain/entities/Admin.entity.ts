import { Email } from './Email';

export interface AdminProps {
  AdminId: string;
  name: string;
  lastName: string;
  email: Email;
  createdAt: string;
}

export class Admin {
  private props: AdminProps;

  private constructor(props: AdminProps) {
    this.props = props;
  }

  static create(
    props: Omit<AdminProps, 'createdAt' | 'updatedAt' | 'version'>,
  ): Admin {
    const now = new Date().toISOString();
    return new Admin({
      ...props,
      createdAt: now,
    });
  }

  static fromPersistence(props: {
    AdminId: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
  }): Admin {
    return new Admin({
      ...props,
      email: new Email(props.email),
    });
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  getEmail(): string {
    return this.props.email.getValue();
  }

  getId(): string {
    return this.props.AdminId;
  }

  getFullName(): string {
    return `${this.props.name} ${this.props.lastName}`;
  }

  getProps(): Readonly<AdminProps> {
    return Object.freeze({ ...this.props });
  }
}
