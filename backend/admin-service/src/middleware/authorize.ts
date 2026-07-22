import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { ForbiddenException } from 'shared-common';

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenException('Admin privileges required'));
    }
    next();
  };
}
