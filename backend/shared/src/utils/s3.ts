import {
  S3Client as AWSS3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../middleware';

const BUCKET = process.env.S3_BUCKET || 'siteforge-media';
const REGION = process.env.AWS_REGION || 'us-east-1';
const CDN_DOMAIN = process.env.CDN_DOMAIN || '';

let s3Client: AWSS3Client | null = null;

function getS3Client(): AWSS3Client {
  if (!s3Client) {
    const config: Record<string, unknown> = { region: REGION };

    // For local development with MinIO
    if (process.env.S3_ENDPOINT) {
      config.endpoint = process.env.S3_ENDPOINT;
      config.forcePathStyle = true;
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
      };
    }

    s3Client = new AWSS3Client(config as any);
  }
  return s3Client;
}

export function getTenantPath(tenantId: string, folder: string, fileName: string): string {
  return `${tenantId}/${folder}/${fileName}`;
}

export async function uploadFile(
  key: string,
  body: Buffer | ReadableStream,
  contentType: string,
  metadata?: Record<string, string>
): Promise<{ key: string; url: string }> {
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body as any,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: metadata,
    })
  );

  const url = CDN_DOMAIN
    ? `https://${CDN_DOMAIN}/${key}`
    : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  logger.info('File uploaded to S3', { key, contentType });

  return { key, url };
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 900 // 15 minutes
): Promise<string> {
  const client = getS3Client();

  return awsGetSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    }),
    { expiresIn }
  );
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const client = getS3Client();

  return awsGetSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn }
  );
}

export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  logger.info('File deleted from S3', { key });
}

export async function listFiles(
  prefix: string,
  maxKeys: number = 100
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const client = getS3Client();

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys,
    })
  );

  return (response.Contents || []).map((obj) => ({
    key: obj.Key!,
    size: obj.Size || 0,
    lastModified: obj.LastModified || new Date(),
  }));
}
