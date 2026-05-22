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
import { tw, buttonSystemFull, buttonSystem, buttonSecondary } from '../shared/ui/tw';

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
    <div className={tw.page}>
      <header>
        <h1 className={tw.pageTitle}>{t('common.manageEmployees')}</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className={tw.card}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
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
                  className={tw.select}
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
                className={buttonSystemFull}
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? t('buttons.creating') : t('buttons.createEmployee')}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className={tw.cardFlush}>
            {isLoadingEmployees ? (
              <p className="p-6 text-center text-sm text-gray-500">{t('common.loadingEmployees')}</p>
            ) : (
              <>
                <div className={tw.tableWrap}>
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
                        <TableRow key={emp._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-gray-900">{emp.full_name}</TableCell>
                          <TableCell className="text-gray-600">{emp.email}</TableCell>
                          <TableCell>
                            <span className={emp.role === 'owner' ? tw.badgeSettled : tw.badgeMuted}>
                              {emp.role_id?.name || emp.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {emp.role !== 'owner' && (
                              <div className="flex justify-center gap-2">
                                <button type="button" title="Edit" onClick={() => handleEditClick(emp)} className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-gray-50">
                                  <IconEdit className="h-5 w-5 text-indigo-600" />
                                </button>
                                <button type="button" onClick={() => handleDelete(emp._id)} disabled={deleteMutation.isLoading} className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-gray-50">
                                  <IconTrashFilled className="h-5 w-5 text-red-600" />
                                </button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className={cn(tw.mobileList, 'p-4')}>
                  {employeesData?.map((emp) => (
                    <article key={emp._id} className={tw.mobileCard}>
                      <h3 className="font-semibold text-gray-900">{emp.full_name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{emp.email}</p>
                      <p className="mt-2">
                        <span className={emp.role === 'owner' ? tw.badgeSettled : tw.badgeMuted}>
                          {emp.role_id?.name || emp.role}
                        </span>
                      </p>
                      {emp.role !== 'owner' && (
                        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                          <button type="button" onClick={() => handleEditClick(emp)} className={cn(buttonSecondary, 'flex-1')}>
                            {t('customers.edit')}
                          </button>
                          <button type="button" onClick={() => handleDelete(emp._id)} disabled={deleteMutation.isLoading} className={cn(buttonSecondary, 'flex-1 text-red-600')}>
                            {t('customers.delete')}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
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
              className={tw.select}
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
              className={buttonSecondary}
              onClick={() => setEditModalOpen(false)}
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="submit"
              className={buttonSystem}
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