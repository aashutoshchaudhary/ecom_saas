import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { pluginService } from '../services/plugin.service';

export class PluginController {
  async listAvailable(req: Request, res: Response) {
    const plugins = await pluginService.listAvailable({
      category: req.query.category as string,
      industry: req.query.industry as string,
      plan: req.query.plan as string,
      search: req.query.search as string,
    });
    res.json({ success: true, data: plugins });
  }

  async listInstalled(req: Request, res: Response) {
    const tenantId = req.query.tenantId as string;
    const installations = await pluginService.listInstalled(tenantId);
    res.json({ success: true, data: installations });
  }

  async install(req: Request, res: Response) {
    const { tenantId, pluginId, config } = req.body;
    const installation = await pluginService.install(tenantId, pluginId, config);
    res.status(StatusCodes.CREATED).json({ success: true, data: installation });
  }

  async uninstall(req: Request, res: Response) {
    const { installationId } = req.params;
    const { tenantId } = req.body;
    const result = await pluginService.uninstall(installationId, tenantId);
    res.json({ success: true, data: result });
  }

  async enable(req: Request, res: Response) {
    const { installationId } = req.params;
    const { tenantId } = req.body;
    const installation = await pluginService.enable(installationId, tenantId);
    res.json({ success: true, data: installation });
  }

  async disable(req: Request, res: Response) {
    const { installationId } = req.params;
    const { tenantId } = req.body;
    const installation = await pluginService.disable(installationId, tenantId);
    res.json({ success: true, data: installation });
  }

  async getConfig(req: Request, res: Response) {
    const { installationId } = req.params;
    const tenantId = req.query.tenantId as string;
    const config = await pluginService.getConfig(installationId, tenantId);
    res.json({ success: true, data: config });
  }

  async updateConfig(req: Request, res: Response) {
    const { installationId } = req.params;
    const { tenantId, config } = req.body;
    const installation = await pluginService.updateConfig(installationId, tenantId, config);
    res.json({ success: true, data: installation });
  }
}

export const pluginController = new PluginController();
