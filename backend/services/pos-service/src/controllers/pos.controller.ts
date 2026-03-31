import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { posService } from '../services/pos.service';

export class PosController {
  async connect(req: Request, res: Response) {
    const connection = await posService.connect(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: connection });
  }

  async disconnect(req: Request, res: Response) {
    const result = await posService.disconnect(req.params.connectionId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async syncOrders(req: Request, res: Response) {
    const result = await posService.syncOrders(req.params.connectionId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async syncProducts(req: Request, res: Response) {
    const result = await posService.syncProducts(req.params.connectionId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async syncInventory(req: Request, res: Response) {
    const result = await posService.syncInventory(req.params.connectionId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async handleWebhook(req: Request, res: Response) {
    const { provider } = req.params;
    const result = await posService.handleWebhook(provider, req.body);
    res.json({ success: true, data: result });
  }

  async listConnections(req: Request, res: Response) {
    const connections = await posService.listConnections(req.query.tenantId as string);
    res.json({ success: true, data: connections });
  }

  async getSyncLogs(req: Request, res: Response) {
    const logs = await posService.getSyncLogs(
      req.params.connectionId,
      req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
    );
    res.json({ success: true, data: logs });
  }
}

export const posController = new PosController();
