import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, deleteEmployee, getRoles, updateEmployee } from '../services/api';
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
  const { t } = useTranslation();
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
      toast.success(t('common.employeeCreated'));
      queryClient.invalidateQueries(['employees']);
      setFullName('');
      setEmail('');
      setPassword('');
      setSelectedRole('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errors.failedToCreateEmployee'));
    }
  });

  // Mutation for deleting an employee
  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success(t('common.employeeDeleted'));
      queryClient.invalidateQueries(['employees']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errors.failedToDeleteEmployee'));
    }
  });

  // Mutation for updating an employee
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: () => {
      toast.success(t('common.employeeUpdated'));
      queryClient.invalidateQueries(['employees']);
      setEditModalOpen(false);
      setEditingEmployee(null);
      setEditForm({ full_name: '', email: '', role_id: '', password: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errors.failedToUpdateEmployee'));
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
    <div className="p-4 md:p-6 min-h-[100dvh]">
      <h1 className="text-3xl font-bold text-neutral-800 text-neutral-200 mb-6">
        {t('common.manageEmployees')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Create Employee Form --- */}
        <div className="md:col-span-1">
          <div className="shadow-input rounded-2xl bg-white p-6 bg-black">
            <h3 className="text-lg font-semibold text-neutral-800 text-neutral-200 mb-4">
              {t('common.createNewEmployee')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="full_name">{t('forms.fullName')} *</Label>
                <Input id="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="email">{t('forms.email')} *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="password">{t('auth.password')} *</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="role">{t('forms.role')} *</Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className={cn(
                    `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm text-neutral-800`
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
              <button
                type="submit"
                className="w-full h-10 rounded-md bg-indigo-600 text-white font-medium"
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? t('buttons.creating') : t('buttons.createEmployee')}
              </button>
            </form>
          </div>
        </div>

        {/* --- Employee List --- */}
        <div className="md:col-span-2">
          <div className="shadow-input rounded-2xl bg-white bg-black">
            {isLoadingEmployees ? (
              <p className="p-4 text-center">{t('common.loadingEmployees')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('customers.name')}</TableHead>
                    <TableHead>{t('forms.email')}</TableHead>
                    <TableHead>{t('forms.role')}</TableHead>
                    <TableHead className="text-center">{t('customers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesData?.map((emp) => (
                    <TableRow key={emp._id} className="hover:bg-gray-50 hover:bg-neutral-800">
                      <TableCell className="font-medium text-neutral-800 text-neutral-200">{emp.full_name}</TableCell>
                      <TableCell className="text-neutral-600 text-neutral-400">{emp.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          emp.role === 'owner' 
                          ? 'bg-indigo-100 text-indigo-800 bg-indigo-900 text-indigo-200' 
                          : 'bg-gray-100 text-gray-800 bg-neutral-800 text-neutral-200'
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
        <h3 className="text-lg font-semibold text-neutral-900 text-neutral-100 mb-4">
          {t('common.editEmployee')}
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <LabelInputContainer>
            <Label htmlFor="edit_full_name">{t('forms.fullName')} *</Label>
            <Input
              id="edit_full_name"
              type="text"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="edit_email">{t('forms.email')} *</Label>
            <Input
              id="edit_email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="edit_password">{t('forms.newPasswordOptional')}</Label>
            <Input
              id="edit_password"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder={t('forms.leaveBlankPassword')}
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="edit_role">{t('forms.role')} *</Label>
            <select
              id="edit_role"
              value={editForm.role_id}
              onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
              required
              className={cn(
                `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
border-neutral-700 bg-neutral-800 text-neutral-200`
              )}
            >
              <option value="" disabled>{isLoadingRoles ? t('forms.loadingRoles') : t('forms.selectRole')}</option>
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
              className="h-10 px-4 rounded-md border border-neutral-200 border-neutral-700 text-neutral-700 text-neutral-200"
              onClick={() => setEditModalOpen(false)}
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-md bg-indigo-600 text-white font-medium"
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? t('buttons.saving') : t('buttons.saveChanges')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmationModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={confirmDelete}
      title={t('common.deleteEmployeeTitle')}
      message={t('common.deleteEmployeeMessage')}
      confirmText={deleteMutation.isLoading ? t('customers.deleting') : t('customers.delete')}
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