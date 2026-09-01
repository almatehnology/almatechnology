import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { SalesRole } from '@/lib/crm-types';

export type CrmRole = 'admin' | 'user';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: CrmRole;
  salesRoles: SalesRole[];
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return null;

  const user = session.user as typeof session.user & {
    username?: string | null;
    role?: string | null;
  };

  const salesRoles = db.prepare('SELECT sales_role AS salesRole FROM user_sales_roles WHERE user_id = ? ORDER BY sales_role')
    .all(user.id) as Array<{ salesRole: SalesRole }>;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || user.email,
    role: user.role === 'admin' ? 'admin' : 'user',
    salesRoles: salesRoles.map((item) => item.salesRole),
  };
}

export function hasSalesRole(user: CurrentUser, role: SalesRole) {
  return user.role === 'admin' || user.salesRoles.includes(role);
}

export async function requireUser(locale: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/crm/login`);
  return user;
}

export async function requireAdmin(locale: string): Promise<CurrentUser> {
  const user = await requireUser(locale);
  if (user.role !== 'admin') redirect(`/${locale}/crm`);
  return user;
}
