import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import path from 'path';
import sharp from 'sharp';
import { s3Service } from './s3.service';
import { config } from '../config';

const prisma = new PrismaClient();

export class AppError extends Error {
  constructor(message: string, public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'AppError';
  }
}

export class MediaService {
  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    data: { tenantId: string; folder?: string; alt?: string; uploadedBy: string },
  ) {
    if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('File type not allowed', StatusCodes.BAD_REQUEST);
    }
    if (file.size > config.upload.maxFileSize) {
      throw new AppError('File too large', StatusCodes.BAD_REQUEST);
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuid()}${ext}`;
    const folder = data.folder || '/';
    const s3Key = `${data.tenantId}${folder === '/' ? '/' : folder + '/'}${fileName}`;

    let processedBuffer = file.buffer;
    let metadata: Record<string, unknown> = {};

    // Process images
    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
      try {
        const image = sharp(file.buffer);
        const imageMetadata = await image.metadata();
        metadata = {
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
        };

        // Create optimized version
        if (imageMetadata.width && imageMetadata.width > 2048) {
          processedBuffer = await image.resize(2048, undefined, { withoutEnlargement: true }).toBuffer();
        }
      } catch (error) {
        console.warn('Image processing failed, using original:', error);
      }
    }

    const cdnUrl = await s3Service.uploadFile(s3Key, processedBuffer, file.mimetype);

    return prisma.mediaFile.create({
      data: {
        tenantId: data.tenantId,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        s3Key,
        s3Bucket: config.s3.bucket,
        cdnUrl,
        folder,
        alt: data.alt,
        metadata,
        uploadedBy: data.uploadedBy,
      },
    });
  }

  async getFile(fileId: string) {
    const file = await prisma.mediaFile.findUnique({ where: { id: fileId } });
    if (!file) throw new AppError('File not found', StatusCodes.NOT_FOUND);
    return file;
  }

  async deleteFile(fileId: string, tenantId: string) {
    const file = await prisma.mediaFile.findUnique({ where: { id: fileId } });
    if (!file || file.tenantId !== tenantId) {
      throw new AppError('File not found', StatusCodes.NOT_FOUND);
    }

    await s3Service.deleteFile(file.s3Key);
    await prisma.mediaFile.delete({ where: { id: fileId } });
    return { success: true };
  }

  async listFiles(tenantId: string, filters: { folder?: string; mimeType?: string; limit?: number; offset?: number }) {
    const where: any = { tenantId };
    if (filters.folder) where.folder = filters.folder;
    if (filters.mimeType) where.mimeType = { startsWith: filters.mimeType };

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return { files, total };
  }

  async getSignedUrl(tenantId: string, fileName: string, mimeType: string, folder?: string) {
    const s3Key = `${tenantId}${folder || '/'}${uuid()}-${fileName}`;
    const url = await s3Service.getSignedUploadUrl(s3Key, mimeType);
    return { url, s3Key };
  }
}

export const mediaService = new MediaService();
