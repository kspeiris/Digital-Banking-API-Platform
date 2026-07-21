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
  const status = error instanceof HttpException ? error.status : 500;
  const message = error.message || 'Something went wrong';

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
      id: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedException('Invalid or expired token'));
  }
}
