import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: config.aws.accessKeyId ? {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  } : undefined,
});

export class S3Service {
  async uploadFile(key: string, body: Buffer, mimeType: string): Promise<string> {
    await s3Client.send(new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
    }));

    return config.cloudfront.distributionUrl
      ? `${config.cloudfront.distributionUrl}/${key}`
      : `https://${config.s3.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    }));
  }

  async getSignedUploadUrl(key: string, mimeType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      ContentType: mimeType,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async listObjects(prefix: string) {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: config.s3.bucket,
      Prefix: prefix,
      Delimiter: '/',
    }));
    return {
      files: response.Contents || [],
      folders: (response.CommonPrefixes || []).map((p) => p.Prefix),
    };
  }
}

export const s3Service = new S3Service();
