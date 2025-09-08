// utils/permissions.ts

/**
 * Checks if user has a specific role.
 * @param role The role to check.
 * @param userRoles The array of user's roles.
 */
export const hasRole = (role: string, userRoles: string[] = []): boolean =>
  userRoles.includes(role);

/**
 * Overloads for hasPermission
 */
export function hasPermission(required: string, userPermissions: string[]): boolean;
export function hasPermission(required: string[], userPermissions: string[]): boolean;

/**
 * Checks if the user has at least one of the required permissions.
 * Accepts either a single permission string or an array of permission strings.
 */
export function hasPermission(
  required: string | string[],
  userPermissions: string[] = []
): boolean {
  if (Array.isArray(required)) {
    return required.some((perm) => userPermissions.includes(perm));
  }
  return userPermissions.includes(required);
}
