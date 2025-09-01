import { S3Client } from '@aws-sdk/client-s3';

import { Config } from '../../../lib/config/env/get-env';

const config = new Config();

export class S3Module {
  protected readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: config.get('REGION'),
    });
  }

  public getClient(): S3Client {
    return this.client;
  }
}

export const s3Client = new S3Module().getClient();
