import { Config } from 'src/shared/lib/config/env/get-env';
import { S3Module } from 'src/shared/modules/storage/s3/client';
import { SendPhotoUseCase } from 'src/user/domain/use-cases/send-photo/send-photo.use-case';
import { AwsS3Service } from 'src/user/infra/aws/aws-s3-client';

export function makeSendPhotoUseCase() {
  const s3Module = new S3Module();
  const s3Service = new AwsS3Service(s3Module);
  const config = new Config();
  const sendPhotoUseCase = new SendPhotoUseCase(
    s3Service,
    config.get('PROFILE_BUCKET_NAME'),
  );
  return sendPhotoUseCase;
}
