export interface EmployeeBody {
  full_name: string;
  email: string;
  password: string;
  roleId?: string;
}

export interface EmployeeUpdateBody {
  full_name?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

export interface EmployeeParams {
  employeeId: string;
}

export interface EmployeeRecord {
  id: string;
  full_name: string;
  email: string;
  role: 'owner' | 'worker';
  role_id: string | null;
}
