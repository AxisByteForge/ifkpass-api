import {
  CheckoutPreference,
  CreateCheckoutPreferenceInput,
  PaymentDetails,
  PaymentGatewayServiceAdapter,
  PaymentGatewayStatus,
} from '../../core/domain/adapters/payment-gateway-adapter';
import { Config } from '../../shared/lib/config/env/get-env';

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export class MercadoPagoService implements PaymentGatewayServiceAdapter {
  private readonly accessToken: string;
  private readonly webhookUrl: string;

  constructor() {
    const config = new Config();
    this.accessToken = config.get('MERCADO_PAGO_ACCESS_TOKEN');
    this.webhookUrl = config.get('MERCADO_PAGO_WEBHOOK_URL');
  }

  async createCheckoutPreference(
    input: CreateCheckoutPreferenceInput,
  ): Promise<CheckoutPreference> {
    const payload = {
      items: [
        {
          title: input.title,
          description: input.description,
          quantity: input.quantity,
          currency_id: input.currency,
          unit_price: input.unitPrice,
        },
      ],
      payer: {
        name: input.payer.name,
        email: input.payer.email,
      },
      metadata: input.metadata,
      external_reference: input.metadata?.userId,
      notification_url: this.webhookUrl,
    };

    const response = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Erro ao criar preferência de pagamento: ${response.status} - ${errorBody}`,
      );
    }

    const data = (await response.json()) as MercadoPagoPreferenceResponse;

    return {
      id: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
      paymentId: data.id,
    };
  }

  private mapStatus(status: string): PaymentGatewayStatus {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'rejected':
      case 'cancelled':
      case 'refunded':
      case 'charged_back':
        return 'rejected';
      case 'pending':
      case 'in_process':
      case 'in_mediation':
      default:
        return 'pending';
    }
  }

  async getPayment(paymentId: string): Promise<PaymentDetails> {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Erro ao consultar pagamento: paymentId ${paymentId} - ${response.status} - ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      status: string;
      metadata?: { userId?: string; user_id?: string };
      external_reference?: string;
    };

    return {
      status: this.mapStatus(data.status),
      userId:
        data.metadata?.userId ??
        data.metadata?.user_id ??
        data.external_reference ??
        undefined,
    };
  }
}
