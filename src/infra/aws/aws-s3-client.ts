import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { StorageServiceAdapter } from '../../core/domain/adapters/aws/aws-s3-adapter';
import { Config } from '../../shared/common/config/env/get-env';

const config = new Config();

export class AwsS3Service implements StorageServiceAdapter {
  private readonly s3Client: S3Client;
  private readonly region: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.get('REGION'),
    });
    this.region = config.get('REGION');
  }

  async sendObject(key: string, bucketName: string) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 604800,
    });

    return {
      uploadUrl,
      photoUrl: `https://${bucketName}.s3.${this.region}.amazonaws.com/${key}`,
    };
  }
}

// certo: https://ifkpass-profile-photos.s3.us-east-1.amazonaws.com/users/e4e874d8-7051-70ab-6f0f-5dd7bbbe80b0/profile-photo.jpg
// errado: https://ifkpass-profile-photos.s3.us-east-1.amazonaws.com/users/e4e874d8-7051-70ab-6f0f-5dd7bbbe80b0/profile-photo.jpg/
