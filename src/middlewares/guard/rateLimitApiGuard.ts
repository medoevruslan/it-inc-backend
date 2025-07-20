import { Request, Response, NextFunction } from 'express';
import { apiRequestsSecurityQueryRepository } from '../../composition-root';
import { HttpStatuses } from '../../shared/enums';

export const RATE_LIMIT_MAX = 5;

export const rateLimitApiGuard = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || 'unknown';
  const url = req.originalUrl;
  const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

  const requestsNum = await apiRequestsSecurityQueryRepository.getDocumentsCount({
    IP: ip,
    URL: url,
    date: { $gte: tenSecondsAgo },
  });

  if (requestsNum > RATE_LIMIT_MAX) {
    res.sendStatus(HttpStatuses.TooManyRequests);
    return;
  }

  apiRequestsSecurityQueryRepository.add({ IP: ip, URL: url, date: new Date() });

  next();
};