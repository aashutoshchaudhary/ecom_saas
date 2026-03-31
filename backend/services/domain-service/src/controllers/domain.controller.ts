import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { domainService } from '../services/domain.service';

export class DomainController {
  async addDomain(req: Request, res: Response) {
    const domain = await domainService.addDomain(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: domain });
  }

  async verifyDomain(req: Request, res: Response) {
    const domain = await domainService.verifyDomain(req.params.domainId);
    res.json({ success: true, data: domain });
  }

  async removeDomain(req: Request, res: Response) {
    const result = await domainService.removeDomain(req.params.domainId, req.body.tenantId);
    res.json({ success: true, data: result });
  }

  async checkDns(req: Request, res: Response) {
    const result = await domainService.checkDns(req.params.domainId);
    res.json({ success: true, data: result });
  }

  async renewSsl(req: Request, res: Response) {
    const result = await domainService.renewSsl(req.params.domainId);
    res.json({ success: true, data: result });
  }

  async listDomains(req: Request, res: Response) {
    const domains = await domainService.listDomains(
      req.query.tenantId as string,
      req.query.websiteId as string | undefined,
    );
    res.json({ success: true, data: domains });
  }
}

export const domainController = new DomainController();
