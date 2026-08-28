export const ROLES = {
  member: "member",
  librarian: "librarian",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE: Role = ROLES.member;

export function toRole(value: unknown): Role {
  return value === ROLES.librarian ? ROLES.librarian : DEFAULT_ROLE;
}

export function isLibrarian(user: { role?: string | null } | null | undefined): boolean {
  return toRole(user?.role) === ROLES.librarian;
}
