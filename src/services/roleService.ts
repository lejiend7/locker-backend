import type { RequestHandler } from 'express';
import { buildApiResponse } from '@/utils/response.ts';

export type AppRole = 'customer' | 'delivery_agent' | 'admin';

export class RoleService {
  hasRole(role: string | undefined, allowedRoles: AppRole[]): boolean {
    if (!role) {
      return false;
    }

    return allowedRoles.includes(role as AppRole);
  }

  formatRoles(allowedRoles: AppRole[]): string {
    if (allowedRoles.length === 1) {
      return allowedRoles[0];
    }

    return allowedRoles.join(', ');
  }

  createRoleGuard(allowedRoles: AppRole[]): RequestHandler {
    return (req, res, next) => {
      const userRole = req.authUser?.role;

      if (!this.hasRole(userRole, allowedRoles)) {
        const roleText = this.formatRoles(allowedRoles);
        const message = `Access denied. Required role: ${roleText}`;

        return res.status(403).json(
          buildApiResponse({
            success: false,
            statusCode: 403,
            message,
            data: [],
            errors: [message],
          })
        );
      }

      return next();
    };
  }
}

export const roleService = new RoleService();
