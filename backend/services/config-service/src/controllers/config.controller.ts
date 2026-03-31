import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { configService } from '../services/config.service';

export class ConfigController {
  async getConfig(req: Request, res: Response) {
    const result = await configService.getConfig(
      req.query.service as string,
      req.query.key as string | undefined,
    );
    res.json({ success: true, data: result });
  }

  async updateConfig(req: Request, res: Response) {
    const config = await configService.updateConfig(req.body);
    res.json({ success: true, data: config });
  }

  async deleteConfig(req: Request, res: Response) {
    const result = await configService.deleteConfig(req.params.configId);
    res.json({ success: true, data: result });
  }

  async getFeatureFlags(req: Request, res: Response) {
    const flags = await configService.getFeatureFlags(req.query.tenantId as string | undefined);
    res.json({ success: true, data: flags });
  }

  async createFeatureFlag(req: Request, res: Response) {
    const flag = await configService.createFeatureFlag(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: flag });
  }

  async toggleFeatureFlag(req: Request, res: Response) {
    const flag = await configService.toggleFeatureFlag(req.params.flagId, req.body.enabled);
    res.json({ success: true, data: flag });
  }

  async updateFeatureFlag(req: Request, res: Response) {
    const flag = await configService.updateFeatureFlag(req.params.flagId, req.body);
    res.json({ success: true, data: flag });
  }
}

export const configController = new ConfigController();
