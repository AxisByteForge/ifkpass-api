import { Either } from '@/shared/types/either';
import { PaymentDetails } from '../../domain/entities/User.entity';

export type PayCardAction = 'create' | 'confirm';

export type PayCardStatus = 'approved' | 'pending' | 'rejected';

export interface PayCardUseCaseRequest {
  userId: string;
  action: PayCardAction;
  paymentStatus?: PayCardStatus;
  paymentId?: string;
}

export type PayCardUseCaseResponse = Either<
  Error,
  | {
      action: 'create';
      amount: number;
      currency: string;
      initPoint: string;
      sandboxInitPoint?: string;
      preferenceId: string;
      alreadyPaid: boolean;
      paymentDetails?: PaymentDetails;
      discountApplied: boolean;
      discountDeadline: string;
    }
  | {
      action: 'confirm';
      alreadyPaid: boolean;
      paymentDetails?: PaymentDetails;
      message: string;
    }
>;
