import { right } from 'src/shared/types/either';

import {
  SendPhotoUseCaseRequest,
  SendPhotoUseCaseResponse,
} from './send-photo.use-case.interface';
import { StorageServiceAdapter } from '../../adapters/aws/aws-s3-adapter';

export class SendPhotoUseCase {
  constructor(
    private storageService: StorageServiceAdapter,
    private readonly bucketName: string,
  ) {}

  async execute({
    userId,
  }: SendPhotoUseCaseRequest): Promise<SendPhotoUseCaseResponse> {
    const key = `users/${userId}/profile-photo.jpg`;

    const { photoUrl, uploadUrl } = await this.storageService.sendObject(
      key,
      this.bucketName,
    );

    return right({
      photoUrl,
      uploadUrl,
    });
  }
}
