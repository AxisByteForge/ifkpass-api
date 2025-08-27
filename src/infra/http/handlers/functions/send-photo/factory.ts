import { SendPhotoUseCase } from '../../../../../core/use-cases/user/send-photo/send-photo.use-case';
import { Config } from '../../../../../shared/common/config/env/get-env';
import { AwsS3Service } from '../../../../aws/aws-s3-client';

export function makeSendPhotoUseCase() {
  const s3Service = new AwsS3Service();
  const config = new Config();
  const sendPhotoUseCase = new SendPhotoUseCase(
    s3Service,
    config.get('PROFILE_BUCKET_NAME'),
  );
  return sendPhotoUseCase;
}
