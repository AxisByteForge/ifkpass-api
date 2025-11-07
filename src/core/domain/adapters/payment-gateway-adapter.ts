export type PaymentGatewayStatus = 'approved' | 'pending' | 'rejected';

export interface CreateCheckoutPreferenceInput {
  title: string;
  description: string;
  quantity: number;
  currency: string;
  unitPrice: number;
  payer: {
    name: string;
    email: string;
  };
  metadata?: Record<string, string | number | boolean>;
}

export interface PaymentDetails {
  status: PaymentGatewayStatus;
  userId?: string | null;
}

export interface CheckoutPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export interface PaymentGatewayServiceAdapter {
  createCheckoutPreference(
    input: CreateCheckoutPreferenceInput,
  ): Promise<CheckoutPreference>;
  getPayment(paymentId: string): Promise<PaymentDetails>;
}
