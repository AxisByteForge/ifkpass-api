import { getConfig } from '@/shared/lib/config/env/get-env';
import { mapStatus } from '@/shared/utils/mapStatus';
import {
  CheckoutPreference,
  CreateCheckoutPreferenceInput,
  PaymentDetails
} from './mercado-pago.interface';

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export const createCheckoutPreference = async (
  input: CreateCheckoutPreferenceInput
): Promise<CheckoutPreference> => {
  const accessToken = getConfig('MERCADO_PAGO_ACCESS_TOKEN');
  const webhookUrl = getConfig('MERCADO_PAGO_WEBHOOK_URL');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  if (input.idempotencyKey) {
    headers['X-Idempotency-Key'] = input.idempotencyKey;
  }

  const payload = {
    items: [
      {
        title: input.title,
        description: input.description,
        quantity: input.quantity,
        currency_id: input.currency,
        unit_price: input.unitPrice
      }
    ],
    payer: {
      name: input.payer.name,
      email: input.payer.email
    },
    metadata: input.metadata,
    external_reference: input.metadata?.userId,
    notification_url: webhookUrl
  };

  const response = await fetch(
    'https://api.mercadopago.com/checkout/preferences',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Erro ao criar preferência de pagamento: ${response.status} - ${errorBody}`
    );
  }

  const data = (await response.json()) as MercadoPagoPreferenceResponse;

  return {
    id: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point
  };
};

export const getPayment = async (
  paymentId: string
): Promise<PaymentDetails> => {
  const accessToken = getConfig('MERCADO_PAGO_ACCESS_TOKEN');

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Erro ao consultar pagamento: paymentId ${paymentId} - ${response.status} - ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    status: string;
    metadata?: { userId?: string; user_id?: string };
    external_reference?: string;
  };

  return {
    status: mapStatus(data.status),
    userId:
      data.metadata?.userId ??
      data.metadata?.user_id ??
      data.external_reference ??
      undefined
  };
};
