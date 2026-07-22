import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from './logger';
import { HttpException, UnauthorizedException } from './errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let status = error instanceof HttpException ? error.status : 500;
  let message = error.message || 'Something went wrong';

  if (error.name === 'ZodError') {
    status = 400;
    try {
      const parsed = JSON.parse(error.message);
      message = parsed.map((p: any) => `${p.path.join('.')}: ${p.message}`).join(', ');
    } catch {
      message = 'Validation failed';
    }
  }

  logger.error(`${req.method} ${req.path} - Status: ${status} - Message: ${message}`, { error });

  res.status(status).json({
    status,
    message,
    timestamp: new Date().toISOString()
  });
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback-secret';

    const decoded = jwt.verify(token, secret) as {
      id?: string;
      sub?: string;
      email: string;
      role: string;
    };

    req.user = {
      id: decoded.id || decoded.sub || '',
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    next(new UnauthorizedException('Invalid or expired token'));
  }
}
