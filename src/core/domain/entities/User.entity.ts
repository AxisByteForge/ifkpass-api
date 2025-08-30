import { Email } from './Email';

export interface UserProps {
  userId: string;
  name: string;
  lastName: string;
  email: Email;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'version'>,
  ): User {
    const now = new Date().toISOString();
    return new User({
      ...props,
      createdAt: now,
      updatedAt: now,
      version: 1,
    });
  }

  static fromPersistence(props: {
    userId: string;
    name: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
  }): User {
    return new User({
      ...props,
      email: new Email(props.email),
    });
  }

  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  promoteToAdmin(): void {
    if (!this.props.isAdmin) {
      this.props.isAdmin = true;
      this.touch();
    }
  }

  updateName(name: string, lastName: string): void {
    this.props.name = name;
    this.props.lastName = lastName;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString();
    this.props.version += 1;
  }

  getEmail(): string {
    return this.props.email.getValue();
  }

  getId(): string {
    return this.props.userId;
  }

  getFullName(): string {
    return `${this.props.name} ${this.props.lastName}`;
  }

  getIsAdmin(): boolean {
    return this.props.isAdmin;
  }

  getProps(): Readonly<UserProps> {
    return Object.freeze({ ...this.props });
  }
}
