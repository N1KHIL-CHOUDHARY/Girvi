import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, deleteEmployee, getRoles } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table";
import { IconTrashFilled, IconEdit } from '@tabler/icons-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Employees() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch Employees
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees().then(res => res.data)
  });

  // Fetch Roles for the dropdown
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles().then(res => res.data)
  });

  // Mutation for creating an employee
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success('Employee created!');
      queryClient.invalidateQueries(['employees']);
      setFullName('');
      setEmail('');
      setPassword('');
      setSelectedRole('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    }
  });

  // Mutation for deleting an employee
  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success('Employee deleted!');
      queryClient.invalidateQueries(['employees']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      full_name: fullName,
      email,
      password,
      role_id: selectedRole,
    });
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
        Manage Employees
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Create Employee Form --- */}
        <div className="md:col-span-1">
          <div className="shadow-input rounded-2xl bg-white p-6 dark:bg-black">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
              Create New Employee
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className={cn(
                    `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
                     dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200`
                  )}
                >
                  <option value="" disabled>{isLoadingRoles ? 'Loading roles...' : 'Select a role'}</option>
                  {rolesData?.map((role) => (
                    // Don't allow assigning 'Owner'
                    !role.is_owner_role && (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    )
                  ))}
                </select>
              </LabelInputContainer>
              <button
                type="submit"
                className="w-full h-10 rounded-md bg-indigo-600 text-white font-medium"
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Employee'}
              </button>
            </form>
          </div>
        </div>

        {/* --- Employee List --- */}
        <div className="md:col-span-2">
          <div className="shadow-input rounded-2xl bg-white dark:bg-black">
            {isLoadingEmployees ? (
              <p className="p-4 text-center">Loading employees...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesData?.map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">{emp.full_name}</TableCell>
                      <TableCell className="text-neutral-600 dark:text-neutral-400">{emp.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          emp.role === 'owner' 
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-200'
                        }`}>
                          {emp.role_id?.name || emp.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {emp.role !== 'owner' && (
                          <div className="flex justify-center gap-2">
                            <button title="Edit (Coming Soon)">
                              <IconEdit className="text-blue-500 w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(emp._id)} disabled={deleteMutation.isLoading}>
                              <IconTrashFilled className="text-red-500 w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};