import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, deleteRole } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table";
import { IconTrashFilled, IconEdit } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

// This is the default permission set for a new role
// (Matches your backend 'role.js' model)
const initialPermissions = {
  can_view_dashboard: true,
  can_view_customers: true,
  can_create_customers: false,
  can_edit_customers: false,
  can_delete_customers: false,
  can_view_tickets: true,
  can_create_tickets: false,
  can_edit_tickets: false,
  can_settle_tickets: false,
  can_delete_tickets: false,
  can_manage_employees: false,
  can_manage_roles: false,
  can_view_reports: false,
};

// Helper to format permission names
const formatLabel = (key) => {
  return key.replace('can_', '').replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
};

export default function Roles() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState(initialPermissions);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success('Role created!');
      queryClient.invalidateQueries(['roles']);
      setRoleName('');
      setPermissions(initialPermissions);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create role'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success('Role deleted!');
      queryClient.invalidateQueries(['roles']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete a role in use'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: roleName, permissions });
  };

  const handlePermissionChange = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className={`p-4 md:p-6 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
        Roles & Permissions
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Create Role Form --- */}
        <div className="md:col-span-1">
          <div className="shadow-input rounded-2xl bg-white p-6 dark:bg-black">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
              Create New Role
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="role_name">Role Name</Label>
                <Input id="role_name" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
              </LabelInputContainer>
              
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {Object.keys(permissions).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="font-normal">{formatLabel(key)}</Label>
                      <input
                        type="checkbox"
                        id={key}
                        checked={permissions[key]}
                        onChange={() => handlePermissionChange(key)}
                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-neutral-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full h-10 rounded-md bg-indigo-600 text-white font-medium"
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Role'}
              </button>
            </form>
          </div>
        </div>

        {/* --- Role List --- */}
        <div className="md:col-span-2">
          <div className="shadow-input rounded-2xl bg-white dark:bg-black">
            {isLoading ? (
              <p className="p-4 text-center">Loading roles...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolesData?.map((role) => (
                    <TableRow key={role._id}>
                      <TableCell className="font-medium text-neutral-800 dark:text-neutral-200">{role.name}</TableCell>
                      <TableCell className="text-neutral-600 dark:text-neutral-400 text-xs">
                        {Object.keys(role.permissions)
                          .filter(k => role.permissions[k] === true)
                          .length} active permissions
                      </TableCell>
                      <TableCell className="text-center">
                        {role.is_owner_role ? (
                          <span className="text-xs text-neutral-500">Locked</span>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <button title="Edit (Coming Soon)">
                              <IconEdit className="text-blue-500 w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(role._id)} disabled={deleteMutation.isLoading}>
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