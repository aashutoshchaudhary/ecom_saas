import { z } from 'zod';

export const uploadFileSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    folder: z.string().optional(),
    alt: z.string().optional(),
    uploadedBy: z.string().uuid(),
  }),
});

export const getFileSchema = z.object({
  params: z.object({
    fileId: z.string().uuid(),
  }),
});

export const deleteFileSchema = z.object({
  params: z.object({
    fileId: z.string().uuid(),
  }),
  body: z.object({
    tenantId: z.string().uuid(),
  }),
});

export const listFilesSchema = z.object({
  query: z.object({
    tenantId: z.string().uuid(),
    folder: z.string().optional(),
    mimeType: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
});

export const getSignedUrlSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    folder: z.string().optional(),
  }),
});

export const createFolderSchema = z.object({
  body: z.object({
    tenantId: z.string().uuid(),
    path: z.string().min(1).regex(/^\/[a-zA-Z0-9_\-/]+$/),
  }),
});
