import { AppPermission, AppRole } from '../../node_modules/.prisma/client';

export type AuthContext = {
  userId: number;
  appRole: AppRole;
  appPermissions: AppPermission[];
  source: 'database' | 'bootstrap';
};

export type CustomerAuthContext = {
  userId: number;
};
