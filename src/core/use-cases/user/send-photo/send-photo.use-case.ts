import {
  SendPhotoUseCaseRequest,
  SendPhotoUseCaseResponse,
} from './send-photo.use-case.interface';
import { StorageServiceAdapter } from '../../../domain/adapters/aws/aws-s3-adapter';
import { right } from '../../../domain/either';

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
