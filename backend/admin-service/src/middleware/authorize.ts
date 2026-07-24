import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { ForbiddenException } from 'shared-common';

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !roles.some((role) => role.toLowerCase() === user.role.toLowerCase())) {
      return next(new ForbiddenException('Admin privileges required'));
    }
    next();
  };
}
