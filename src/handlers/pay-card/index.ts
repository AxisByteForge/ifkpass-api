import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';

import { RequestHeaders } from '@/shared/types/headers.type';
import { payCard as payCardService } from '@/services/pay-card/pay-card.service';
import { verifyToken } from '@/infra/jwt/jwt.service';

const schema = z.object({
  action: z.enum(['generate-checkout', 'complete-payment']),
  paymentStatus: z.enum(['approved', 'pending', 'rejected']).optional(),
  paymentId: z.string().optional()
});

const payCard = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = event.headers as Partial<RequestHeaders>;
  const token = await verifyToken(headers.Authorization ?? '');

  const body = schema.parse(JSON.parse(event.body || '{}'));
  const result = await payCardService({
    userId: token.Id,
    action: body.action,
    paymentStatus: body.paymentStatus,
    paymentId: body.paymentId
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};

export { payCard };
