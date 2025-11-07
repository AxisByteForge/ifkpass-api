import { APIGatewayProxyEvent } from 'aws-lambda';

import { makePayCardUseCase } from '../../pay-card/factory';
import { MercadoPagoService } from 'src/infra/mercado-pago/mercado-pago.service';

const mercadoPagoService = new MercadoPagoService();

function extractPaymentId(
  event: APIGatewayProxyEvent,
  body: any,
): string | null {
  if (body?.data?.id) return body.data.id as string;
  if (body?.id) return body.id as string;
  if (event.queryStringParameters?.id) return event.queryStringParameters.id;
  if (event.queryStringParameters?.['data.id']) {
    return event.queryStringParameters['data.id'];
  }
  return null;
}

async function mercadoPagoWebhook(event: APIGatewayProxyEvent) {
  try {
    console.log('event', event);
    const body = event.body ? JSON.parse(event.body) : {};

    const paymentId = extractPaymentId(event, body);

    if (!paymentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Identificador do pagamento não informado.',
        }),
      };
    }

    const payment = await mercadoPagoService.getPayment(paymentId);

    if (!payment.userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Pagamento sem usuário associado.',
        }),
      };
    }

    const useCase = makePayCardUseCase();
    const result = await useCase.execute({
      userId: payment.userId,
      action: 'confirm',
      paymentStatus: payment.status,
      paymentId,
    });

    if (result.isLeft()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: result.value.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Pagamento sincronizado com sucesso.',
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : 'Erro interno ao processar webhook do Mercado Pago.',
      }),
    };
  }
}

export { mercadoPagoWebhook };
