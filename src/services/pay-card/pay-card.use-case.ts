import { findUserById, updateUser } from '@/infra/database/user-db.service';
import { PayCardInput, PayCardOutput } from './pay-card.use-case.interface';
import { createCheckoutPreference } from '@/infra/mercado-pago/mercado-pago.service';

const year = new Date().getFullYear();
const DISCOUNT_DEADLINE = new Date(`${year}-03-08T23:59:59.999Z`);
const CURRENCY = 'BRL';

const isDiscountAvailable = (currentDate: Date): boolean => {
  return currentDate.getTime() <= DISCOUNT_DEADLINE.getTime();
};

const computeAmount = (rank: string | undefined, now: Date): number => {
  const discount = isDiscountAvailable(now);
  const blackBelt = rank === 'Preta';

  if (blackBelt) {
    return discount ? 80 : 100;
  }

  return discount ? 50 : 80;
};

const getBeltCategory = (rank?: string): string => {
  return rank === 'Preta' ? 'black' : 'colored';
};

export const payCard = async (input: PayCardInput): Promise<PayCardOutput> => {
  const user = await findUserById(input.userId);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  if (user.status === 'rejected') {
    throw new Error(
      'Usuário com inscrição rejeitada. Entre em contato com a administração.'
    );
  }

  const beltCategory = getBeltCategory(user.rank);
  const currentPaymentDetails = user.paymentDetails;

  if (input.action === 'complete-payment') {
    if (!input.paymentStatus) {
      throw new Error('Status do pagamento é obrigatório.');
    }

    if (
      currentPaymentDetails &&
      currentPaymentDetails.paymentId === input.paymentId &&
      currentPaymentDetails.status === input.paymentStatus
    ) {
      return {
        message: 'Pagamento já processado anteriormente.'
      };
    }

    await updateUser(input.userId, {
      paymentDetails: {
        alreadyPaid: input.paymentStatus === 'approved',
        status: input.paymentStatus,
        paymentId: input.paymentId,
        rank: user.rank,
        beltCategory,
        updatedAt: new Date().toISOString()
      }
    });

    return {
      message:
        input.paymentStatus === 'approved'
          ? 'Pagamento confirmado com sucesso.'
          : 'Pagamento não aprovado. Verifique o status na plataforma de pagamento.'
    };
  }

  // Gerar checkout
  const now = new Date();
  const amount = computeAmount(user.rank, now);
  const discountApplied = isDiscountAvailable(now);

  const preference = await createCheckoutPreference({
    title: 'IFK Pass - Anuidade',
    description: 'Pagamento da anuidade do cartão IFK Pass',
    quantity: 1,
    currency: CURRENCY,
    unitPrice: amount,
    payer: {
      name: `${user.name} ${user.lastName}`.trim(),
      email: user.email
    },
    metadata: {
      userId: input.userId,
      rank: user.rank ?? 'Não informado',
      beltCategory
    },
    idempotencyKey: user.cardId
  });

  await updateUser(input.userId, {
    paymentDetails: {
      alreadyPaid: currentPaymentDetails?.alreadyPaid ?? false,
      status: 'pending',
      preferenceId: preference.id,
      amount,
      currency: CURRENCY,
      discountApplied,
      rank: user.rank,
      beltCategory,
      updatedAt: new Date().toISOString()
    }
  });

  return {
    checkoutUrl: preference.initPoint || preference.sandboxInitPoint
  };
};
