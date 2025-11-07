import { left, right } from 'src/shared/types/either';

import {
  PayCardUseCaseRequest,
  PayCardUseCaseResponse,
} from './pay-card.use-case.interface';
import { UserRepository } from '../../domain/repositories/UserRepository';
import {
  PaymentGatewayServiceAdapter,
  CheckoutPreference,
} from '../../domain/adapters/payment-gateway-adapter';
import {
  KarateRank,
  UserStatus,
  BeltCategory,
} from '../../domain/entities/User.entity';

const DISCOUNT_DEADLINE = new Date('2025-03-08T23:59:59.999Z');
const CURRENCY = 'BRL';

function isDiscountAvailable(currentDate: Date): boolean {
  return currentDate.getTime() <= DISCOUNT_DEADLINE.getTime();
}

function computeAmount(rank: KarateRank | undefined, now: Date): number {
  const discount = isDiscountAvailable(now);
  const blackBelt = rank === KarateRank.PRETA;

  if (blackBelt) {
    return discount ? 80 : 100;
  }

  return discount ? 50 : 80;
}

export class PayCardUseCase {
  constructor(
    private userRepository: UserRepository,
    private paymentGateway: PaymentGatewayServiceAdapter,
  ) {}

  async execute({
    userId,
    action,
    paymentStatus,
    paymentId,
  }: PayCardUseCaseRequest): Promise<PayCardUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new Error('Usuário não encontrado'));
    }

    if (user.getStatus() === UserStatus.REJECTED) {
      return left(
        new Error(
          'Usuário com inscrição rejeitada. Entre em contato com a administração.',
        ),
      );
    }

    const userProps = user.getProps();
    const beltCategory = this.getBeltCategory(userProps.rank);

    const currentPaymentDetails = user.getPaymentDetails();

    if (action === 'confirm') {
      if (!paymentStatus) {
        return left(new Error('Status do pagamento é obrigatório.'));
      }

      if (
        currentPaymentDetails &&
        currentPaymentDetails.paymentId === paymentId &&
        currentPaymentDetails.status === paymentStatus
      ) {
        return right({
          action: 'confirm',
          alreadyPaid: currentPaymentDetails.alreadyPaid,
          paymentDetails: currentPaymentDetails,
          paymentId: currentPaymentDetails.paymentId ?? paymentId,
          message: 'Pagamento já processado anteriormente.',
        });
      }

      user.updatePaymentDetails({
        alreadyPaid: paymentStatus === 'approved',
        status: paymentStatus,
        paymentId,
        rank: userProps.rank,
        beltCategory,
      });

      const paymentDetails = user.getPaymentDetails();

      if (!paymentDetails) {
        return left(
          new Error('Não foi possível atualizar detalhes de pagamento.'),
        );
      }

      await this.userRepository.updatePaymentDetails(userId, paymentDetails);

      return right({
        action: 'confirm',
        alreadyPaid: paymentDetails.alreadyPaid,
        paymentDetails,
        paymentId: paymentDetails.paymentId ?? paymentId,
        message:
          paymentStatus === 'approved'
            ? 'Pagamento confirmado com sucesso.'
            : 'Pagamento não aprovado. Verifique o status na plataforma de pagamento.',
      });
    }

    const amount = computeAmount(userProps.rank, new Date());
    const discountApplied = isDiscountAvailable(new Date());

    const preference = await this.createCheckoutPreference(
      userProps.name,
      userProps.lastName,
      userProps.email,
      amount,
      userId,
      userProps.rank,
      beltCategory,
    );

    user.updatePaymentDetails({
      alreadyPaid: user.hasAlreadyPaid(),
      status: 'pending',
      preferenceId: preference.id,
      paymentId: preference.paymentId,
      amount,
      currency: CURRENCY,
      discountApplied,
      rank: userProps.rank,
      beltCategory,
    });

    const paymentDetails = user.getPaymentDetails();

    if (paymentDetails) {
      await this.userRepository.updatePaymentDetails(userId, paymentDetails);
    }

    return right({
      action: 'create',
      amount,
      currency: CURRENCY,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint,
      preferenceId: preference.id,
      paymentId: preference.paymentId,
      alreadyPaid: user.hasAlreadyPaid(),
      paymentDetails,
      discountApplied,
      discountDeadline: DISCOUNT_DEADLINE.toISOString(),
    });
  }

  private async createCheckoutPreference(
    name: string,
    lastName: string,
    email: string,
    amount: number,
    userId: string,
    rank: KarateRank | undefined,
    beltCategory: BeltCategory,
  ): Promise<CheckoutPreference> {
    const preference = await this.paymentGateway.createCheckoutPreference({
      title: 'IFK Pass - Anuidade',
      description: 'Pagamento da anuidade do cartão IFK Pass',
      quantity: 1,
      currency: CURRENCY,
      unitPrice: amount,
      payer: {
        name: `${name} ${lastName}`.trim(),
        email,
      },
      metadata: {
        userId,
        user_id: userId,
        rank: rank ?? 'Não informado',
        beltCategory,
      },
    });

    return preference;
  }

  private getBeltCategory(rank?: KarateRank): BeltCategory {
    return rank === KarateRank.PRETA ? 'black' : 'colored';
  }
}
