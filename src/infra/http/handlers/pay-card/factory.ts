import { DynamoModule } from '@/shared/modules/database/dynamo/client';

import { PayCardUseCase } from '@/core/use-cases/pay-card/pay-card.use-case';
import { DynamoUserRepository } from '@/infra/database/dynamo/users-repository.dynamo';
import { MercadoPagoService } from '@/infra/mercado-pago/mercado-pago.service';

export function makePayCardUseCase() {
  const dynamoModule = new DynamoModule();
  const userRepository = new DynamoUserRepository(dynamoModule);
  const mercadoPagoService = new MercadoPagoService();

  return new PayCardUseCase(userRepository, mercadoPagoService);
}
