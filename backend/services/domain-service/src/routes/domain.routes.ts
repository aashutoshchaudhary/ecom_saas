import { Router } from 'express';
import { domainController } from '../controllers/domain.controller';
import { validate } from '../middleware/validate';
import {
  addDomainSchema,
  verifyDomainSchema,
  removeDomainSchema,
  checkDnsSchema,
  renewSslSchema,
  listDomainsSchema,
} from '../validators/domain.validator';

const router = Router();

router.get('/', validate(listDomainsSchema), domainController.listDomains.bind(domainController));
router.post('/', validate(addDomainSchema), domainController.addDomain.bind(domainController));
router.post('/:domainId/verify', validate(verifyDomainSchema), domainController.verifyDomain.bind(domainController));
router.delete('/:domainId', validate(removeDomainSchema), domainController.removeDomain.bind(domainController));
router.post('/:domainId/check-dns', validate(checkDnsSchema), domainController.checkDns.bind(domainController));
router.post('/:domainId/renew-ssl', validate(renewSslSchema), domainController.renewSsl.bind(domainController));

export default router;
