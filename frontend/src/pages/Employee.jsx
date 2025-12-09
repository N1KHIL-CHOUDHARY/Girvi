import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, deleteEmployee, getRoles, updateEmployee } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table";
import { Dialog, DialogContent } from '../components/ui/Dialog';
import ConfirmationModal from '../components/ConfirmationModal';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role_id: '',
    password: '',
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  // Mutation for updating an employee
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: () => {
      toast.success('Employee updated!');
      queryClient.invalidateQueries(['employees']);
      setEditModalOpen(false);
      setEditingEmployee(null);
      setEditForm({ full_name: '', email: '', role_id: '', password: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    },
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
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setEditForm({
      full_name: emp.full_name || '',
      email: emp.email || '',
      role_id: emp.role_id?._id || '',
      password: '',
    });
    setEditModalOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const payload = {
      full_name: editForm.full_name,
      email: editForm.email,
      role_id: editForm.role_id,
    };

    if (editForm.password) {
      payload.password = editForm.password;
    }

    updateMutation.mutate({ id: editingEmployee._id, payload });
  };

  return (
    <>
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
                    <TableRow key={emp._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
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
                            <button title="Edit" onClick={() => handleEditClick(emp)}>
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

    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Edit Employee
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <LabelInputContainer>
            <Label htmlFor="edit_full_name">Full Name *</Label>
            <Input
              id="edit_full_name"
              type="text"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="edit_email">Email *</Label>
            <Input
              id="edit_email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="edit_password">New Password (optional)</Label>
            <Input
              id="edit_password"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="edit_role">Role *</Label>
            <select
              id="edit_role"
              value={editForm.role_id}
              onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
              required
              className={cn(
                `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200`
              )}
            >
              <option value="" disabled>{isLoadingRoles ? 'Loading roles...' : 'Select a role'}</option>
              {rolesData?.map((role) => (
                !role.is_owner_role && (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                )
              ))}
            </select>
          </LabelInputContainer>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="h-10 px-4 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-md bg-indigo-600 text-white font-medium"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmationModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={confirmDelete}
      title="Delete employee?"
      message="This action cannot be undone. The employee will be removed."
      confirmText={deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
    />
    </>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};