import { right } from 'src/shared/types/either';

import {
  SendPhotoUseCaseRequest,
  SendPhotoUseCaseResponse,
} from './send-photo.use-case.interface';
import { StorageServiceAdapter } from '../../domain/adapters/aws-s3-adapter';

export class SendPhotoUseCase {
  constructor(
    private storageService: StorageServiceAdapter,
    private readonly bucketName: string,
  ) {}

  async execute({
    Id,
  }: SendPhotoUseCaseRequest): Promise<SendPhotoUseCaseResponse> {
    const key = `users/${Id}/profile-photo.jpg`;

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
