import { Request, Response, NextFunction } from 'express';
import { HttpException } from 'shared-common';
import { logger } from 'shared-common';

export function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let status = error instanceof HttpException ? error.status : 500;
  let message = error.message || 'Something went wrong';

  if (error.name === 'ZodError' || (error as any).issues) {
    status = 400;
    if ((error as any).issues) {
      message = (error as any).issues.map((issue: any) => `${issue.path?.join('.') || ''}: ${issue.message}`).join(', ');
    } else {
      try {
        const parsed = JSON.parse(error.message);
        message = parsed.map((p: any) => `${p.path?.join('.') || ''}: ${p.message}`).join(', ');
      } catch {
        message = 'Validation failed';
      }
    }
  }

  logger.error(`${req.method} ${req.path} - Status: ${status} - Message: ${message}`, { error });

  res.status(status).json({
    success: false,
    message,
  });
}
