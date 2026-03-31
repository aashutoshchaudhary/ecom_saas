import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { mediaService } from '../services/media.service';

export class MediaController {
  async uploadFile(req: Request, res: Response) {
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: 'No file provided' });
      return;
    }

    const file = await mediaService.uploadFile(req.file, {
      tenantId: req.body.tenantId,
      folder: req.body.folder,
      alt: req.body.alt,
      uploadedBy: req.body.uploadedBy,
    });

    res.status(StatusCodes.CREATED).json({ success: true, data: file });
  }

  async getFile(req: Request, res: Response) {
    const file = await mediaService.getFile(req.params.fileId);
    res.json({ success: true, data: file });
  }

  async deleteFile(req: Request, res: Response) {
    const result = await mediaService.deleteFile(req.params.fileId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async listFiles(req: Request, res: Response) {
    const result = await mediaService.listFiles(req.query.tenantId as string, {
      folder: req.query.folder as string,
      mimeType: req.query.mimeType as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    });
    res.json({ success: true, data: result });
  }

  async getSignedUrl(req: Request, res: Response) {
    const result = await mediaService.getSignedUrl(
      req.body.tenantId,
      req.body.fileName,
      req.body.mimeType,
      req.body.folder,
    );
    res.json({ success: true, data: result });
  }
}

export const mediaController = new MediaController();
