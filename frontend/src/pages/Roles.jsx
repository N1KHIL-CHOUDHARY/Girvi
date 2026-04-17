import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, deleteRole, updateRole } from '../services/api';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import ConfirmationModal from '../components/ConfirmationModal';
import { IconTrashFilled, IconEdit, IconShieldCheck } from '@tabler/icons-react';
import toast from 'react-hot-toast';

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

const formatLabel = (key) =>
  key.replace('can_', '').replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

/* ── Reusable permission checklist ── */
function PermissionList({ permissions, onChange }) {
  return (
    <div style={{ maxHeight: '15rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Object.keys(permissions).map((key) => (
        <label
          key={key}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', padding: '0.375rem 0',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{formatLabel(key)}</span>
          <input
            type="checkbox"
            checked={permissions[key]}
            onChange={() => onChange(key)}
            style={{ width: '1rem', height: '1rem', accentColor: 'var(--brand)', cursor: 'pointer' }}
          />
        </label>
      ))}
    </div>
  );
}

/* ── Inline modal ── */
function EditModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="pm-modal-overlay" onClick={onClose}>
      <div className="pm-modal" style={{ borderRadius: 'var(--radius-xl)', maxWidth: '30rem' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

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
    queryFn: () => getRoles().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success(t('common.roleCreated'));
      queryClient.invalidateQueries(['roles']);
      setRoleName(''); setPermissions(initialPermissions);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToCreateRole')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => { toast.success(t('common.roleDeleted')); queryClient.invalidateQueries(['roles']); },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.cannotDeleteRoleInUse')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => {
      toast.success(t('common.roleUpdated'));
      queryClient.invalidateQueries(['roles']);
      setEditModalOpen(false); setEditingRole(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToUpdateRole')),
  });

  const handleEditClick = (role) => {
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditPermissions(role.permissions || initialPermissions);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingRole) return;
    updateMutation.mutate({ id: editingRole._id, payload: { name: editRoleName, permissions: editPermissions } });
  };

  return (
    <>
      <div style={{ padding: 'var(--page-py) var(--page-px)' }}>
        <div className="pm-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <IconShieldCheck size={20} style={{ color: 'var(--brand)' }} />
            <h1 className="pm-section-title">{t('common.rolesAndPermissions')}</h1>
          </div>
          <p className="pm-section-subtitle">{t('common.rolesDescription', 'Manage team roles and access permissions')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <style>{`@media(min-width:1024px){.roles-grid{grid-template-columns:1fr 2fr!important}}`}</style>
          <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

            {/* Create form */}
            <div className="pm-form-section">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                {t('common.createNewRole')}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name: roleName, permissions }); }}>
                <div className="pm-form-group">
                  <Label className="pm-label">{t('forms.roleName')}</Label>
                  <Input
                    type="text"
                    className="pm-input"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>
                <div className="pm-form-group" style={{ marginBottom: '1.5rem' }}>
                  <Label className="pm-label">{t('forms.permissions')}</Label>
                  <PermissionList
                    permissions={permissions}
                    onChange={(key) => setPermissions(p => ({ ...p, [key]: !p[key] }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="pm-btn pm-btn-primary pm-btn-full"
                >
                  {createMutation.isPending ? t('buttons.creating') : t('buttons.createRole')}
                </button>
              </form>
            </div>

            {/* Roles table */}
            <div>
              {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {t('common.loadingRoles')}
                </div>
              ) : (
                <div className="pm-table-wrap">
                  <table className="pm-table">
                    <thead>
                      <tr>
                        <th>{t('forms.roleName')}</th>
                        <th>{t('forms.permissions')}</th>
                        <th style={{ textAlign: 'center' }}>{t('customers.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rolesData || []).map((role) => {
                        const activeCount = Object.values(role.permissions || {}).filter(Boolean).length;
                        return (
                          <tr key={role._id}>
                            <td className="pm-td-primary">{role.name}</td>
                            <td>
                              <span className="pm-badge pm-badge-neutral">
                                {t('common.activePermissions', { count: activeCount })}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {role.is_owner_role ? (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{t('common.locked')}</span>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                  <button
                                    onClick={() => handleEditClick(role)}
                                    className="pm-btn pm-btn-ghost pm-btn-sm"
                                    title={t('customers.edit')}
                                  >
                                    <IconEdit size={15} style={{ color: 'var(--brand)' }} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget(role._id)}
                                    disabled={deleteMutation.isPending}
                                    className="pm-btn pm-btn-ghost pm-btn-sm"
                                    title={t('customers.delete')}
                                  >
                                    <IconTrashFilled size={15} style={{ color: 'var(--danger-text)' }} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditModal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          {t('common.editRole')}
        </h3>
        <form onSubmit={handleEditSubmit}>
          <div className="pm-form-group">
            <Label className="pm-label">{t('forms.roleName')}</Label>
            <Input
              type="text"
              className="pm-input"
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              required
            />
          </div>
          <div className="pm-form-group" style={{ marginBottom: '1.5rem' }}>
            <Label className="pm-label">{t('forms.permissions')}</Label>
            <PermissionList
              permissions={editPermissions}
              onChange={(key) => setEditPermissions(p => ({ ...p, [key]: !p[key] }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setEditModalOpen(false)} className="pm-btn pm-btn-secondary">
              {t('buttons.cancel')}
            </button>
            <button type="submit" disabled={updateMutation.isPending} className="pm-btn pm-btn-primary">
              {updateMutation.isPending ? t('buttons.saving') : t('buttons.saveChanges')}
            </button>
          </div>
        </form>
      </EditModal>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
        title={t('common.deleteRoleTitle')}
        message={t('common.deleteRoleMessage')}
        confirmText={deleteMutation.isPending ? t('customers.deleting') : t('customers.delete')}
      />
    </>
  );
}