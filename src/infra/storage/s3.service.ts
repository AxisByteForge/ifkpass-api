import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getConfig } from '@/shared/lib/config/env/get-env';

export const s3Client = new S3Client({
  region: getConfig('REGION')
});

export const getPresignedUploadUrl = async (
  key: string,
  bucketName: string
): Promise<{ photoUrl: string; uploadUrl: string }> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: 'image/jpeg'
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const photoUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

  return { photoUrl, uploadUrl };
};
