import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Config } from '@/shared/lib/config/env/get-env';
import { S3Module } from '@/shared/modules/storage/s3/client';
import { StorageServiceAdapter } from '@/core/domain/adapters/aws-s3-adapter';

const config = new Config();

export class AwsS3Service implements StorageServiceAdapter {
  private readonly client: S3Client;
  private readonly region: string;

  constructor(s3: S3Module) {
    this.client = s3.getClient();
    this.region = config.get('REGION');
  }

  async sendObject(key: string, bucketName: string) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: 'image/jpeg'
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 604800
    });

    return {
      uploadUrl,
      photoUrl: `https://${bucketName}.s3.${this.region}.amazonaws.com/${key}`
    };
  }
}
