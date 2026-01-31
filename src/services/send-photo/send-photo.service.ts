import { getPresignedUploadUrl } from '@/infra/storage/s3.service';
import { getConfig } from '@/shared/lib/config/env/get-env';
import {
  SendPhotoInput,
  SendPhotoOutput
} from './send-photo.service.interface';

const bucketName = getConfig('PROFILE_BUCKET_NAME');

export const sendPhoto = async (
  input: SendPhotoInput
): Promise<SendPhotoOutput> => {
  const key = `users/${input.Id}/profile-photo.jpg`;

  const { photoUrl, uploadUrl } = await getPresignedUploadUrl(key, bucketName);

  return {
    photoUrl,
    uploadUrl
  };
};
