import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  const requestId = `REQ-${dateStr}-${randomStr}`;
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
