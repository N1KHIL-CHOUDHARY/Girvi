import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, deleteRole, updateRole } from '../services/api';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table";
import { Dialog, DialogContent } from '../components/ui/Dialog';
import ConfirmationModal from '../components/ConfirmationModal';
import { IconTrashFilled, IconEdit } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';


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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState(initialPermissions);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editPermissions, setEditPermissions] = useState(initialPermissions);
  const [editRoleName, setEditRoleName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success(t('common.roleCreated'));
      queryClient.invalidateQueries(['roles']);
      setRoleName('');
      setPermissions(initialPermissions);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToCreateRole')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success(t('common.roleDeleted'));
      queryClient.invalidateQueries(['roles']);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.cannotDeleteRoleInUse')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => {
      toast.success(t('common.roleUpdated'));
      queryClient.invalidateQueries(['roles']);
      setEditModalOpen(false);
      setEditingRole(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToUpdateRole')),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: roleName, permissions });
  };

  const handlePermissionChange = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  const handleEditClick = (role) => {
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditPermissions(role.permissions || initialPermissions);
    setEditModalOpen(true);
  };

  const handleEditPermissionChange = (key) => {
    setEditPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingRole) return;
    updateMutation.mutate({
      id: editingRole._id,
      payload: { name: editRoleName, permissions: editPermissions },
    });
  };

  return (
    <>
    <div className="p-4 md:p-6 min-h-[100dvh]">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">
        {t('common.rolesAndPermissions')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Create Role Form --- */}
        <div className="md:col-span-1">
          <div className="shadow-input rounded-2xl bg-white p-6 bg-black">
            <h3 className="text-lg font-semibold text-neutral-800 text-neutral-200 mb-4">
              {t('common.createNewRole')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="role_name">{t('forms.roleName')}</Label>
                <Input id="role_name" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
              </LabelInputContainer>
              
              <div className="space-y-2">
                <Label>{t('forms.permissions')}</Label>
                <div className="max-h-60 overflow-y-auto scroll-contain space-y-2 pr-2">
                  {Object.keys(permissions).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="font-normal">{formatLabel(key)}</Label>
                      <input
                        type="checkbox"
                        id={key}
                        checked={permissions[key]}
                        onChange={() => handlePermissionChange(key)}
                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-neutral-300 border-neutral-700 bg-gray-50 bg-neutral-800"
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
                {createMutation.isLoading ? t('buttons.creating') : t('buttons.createRole')}
              </button>
            </form>
          </div>
        </div>

        {/* --- Role List --- */}
        <div className="md:col-span-2">
          <div className="shadow-input rounded-2xl bg-white bg-black text-white text-base">
            {isLoading ? (
              <p className="p-4 text-center text-neutral-600 text-neutral-400">{t('common.loadingRoles')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-neutral-800 text-neutral-200">{t('forms.roleName')}</TableHead>
                    <TableHead className="text-neutral-800 text-neutral-200">{t('forms.permissions')}</TableHead>
                    <TableHead className="text-center text-neutral-800 text-neutral-200">{t('customers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolesData?.map((role) => (
                    <TableRow key={role._id} className="hover:bg-gray-50 hover:bg-neutral-800">
                      <TableCell className="font-medium text-neutral-800 text-neutral-200">{role.name}</TableCell>
                      <TableCell className="text-neutral-600 text-neutral-400 text-xs">
                        {t('common.activePermissions', { count: Object.keys(role.permissions).filter(k => role.permissions[k] === true).length })}
                      </TableCell>
                      <TableCell className="text-center">
                        {role.is_owner_role ? (
                          <span className="text-xs text-neutral-500">{t('common.locked')}</span>
                        ) : (
                          <div className="flex justify-center gap-2">
                            <button title="Edit" onClick={() => handleEditClick(role)}>
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

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <h3 className="text-lg font-semibold text-neutral-900 text-neutral-100 mb-4">
            {t('common.editRole')}
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="edit_role_name">{t('forms.roleName')}</Label>
              <Input
                id="edit_role_name"
                type="text"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
                required
              />
            </LabelInputContainer>
            <div className="space-y-2">
              <Label>{t('forms.permissions')}</Label>
              <div className="max-h-60 overflow-y-auto scroll-contain space-y-2 pr-2">
                {Object.keys(editPermissions).map((key) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`edit_${key}`} className="font-normal">{formatLabel(key)}</Label>
                    <input
                      type="checkbox"
                      id={`edit_${key}`}
                      checked={editPermissions[key]}
                      onChange={() => handleEditPermissionChange(key)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-neutral-300 border-neutral-700 bg-gray-50 bg-neutral-800"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="h-10 px-4 rounded-md border border-neutral-200 border-neutral-700 text-neutral-700 text-neutral-200"
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
        title={t('common.deleteRoleTitle')}
        message={t('common.deleteRoleMessage')}
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