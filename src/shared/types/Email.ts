export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      throw new Error('invalid email');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}
