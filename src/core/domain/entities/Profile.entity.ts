import { randomUUID } from 'node:crypto';

export interface ProfileProps {
  userId: string;
  birthDate: string;
  city: string;
  cpf: string;
  dojo: string;
  rank: string;
  sensei: string;
  photoUrl: string;
  cardId: string;
  updatedAt: string;
}

export class Profile {
  private props: ProfileProps;

  private constructor(props: ProfileProps) {
    this.props = props;
  }

  static create(props: Omit<ProfileProps, 'cardId' | 'updatedAt'>): Profile {
    const cardId = Profile.generateCardId();
    return new Profile({
      ...props,
      cardId,
      updatedAt: new Date().toISOString(),
    });
  }

  static fromPersistence(props: ProfileProps): Profile {
    return new Profile(props);
  }

  static generateCardId(): string {
    const year = new Date().getFullYear();
    const uuid = randomUUID();
    return `KTY-${year}-${uuid}`;
  }

  updateProfile(
    update: Partial<Omit<ProfileProps, 'userId' | 'cardId' | 'updatedAt'>>,
  ): void {
    this.props = {
      ...this.props,
      ...update,
      updatedAt: new Date().toISOString(),
    };
  }

  getProps(): Readonly<ProfileProps> {
    return Object.freeze({ ...this.props });
  }

  getUserId(): string {
    return this.props.userId;
  }

  getCardId(): string {
    return this.props.cardId;
  }

  getCpf(): string {
    return this.props.cpf;
  }

  getUpdatedAt(): string {
    return this.props.updatedAt;
  }
}
