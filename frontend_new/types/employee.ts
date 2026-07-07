import { Role } from './role';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  role: Role | string;
  isActive: boolean;
  shopId: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeListResponse = Employee[];