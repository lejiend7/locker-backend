import { roleService, type AppRole } from '@/services/roleService.ts';

export function roleMiddleware(allowedRoles: AppRole[]) {
	return roleService.createRoleGuard(allowedRoles);
}
