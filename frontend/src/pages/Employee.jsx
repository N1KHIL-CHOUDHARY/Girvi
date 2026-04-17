import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, deleteEmployee, getRoles, updateEmployee } from '../services/api';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { Dialog, DialogContent } from '../components/ui/Dialog';
import ConfirmationModal from '../components/ConfirmationModal';
import { IconTrashFilled, IconEdit } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function Employees() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [fullName,     setFullName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editModalOpen,    setEditModalOpen]    = useState(false);
  const [editingEmployee,  setEditingEmployee]  = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role_id: '', password: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees().then(r => r.data),
  });
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success(t('common.employeeCreated'));
      queryClient.invalidateQueries(['employees']);
      setFullName(''); setEmail(''); setPassword(''); setSelectedRole('');
    },
    onError: err => toast.error(err.response?.data?.message || t('errors.failedToCreateEmployee')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { toast.success(t('common.employeeDeleted')); queryClient.invalidateQueries(['employees']); },
    onError: err => toast.error(err.response?.data?.message || t('errors.failedToDeleteEmployee')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: () => {
      toast.success(t('common.employeeUpdated'));
      queryClient.invalidateQueries(['employees']);
      setEditModalOpen(false); setEditingEmployee(null);
      setEditForm({ full_name: '', email: '', role_id: '', password: '' });
    },
    onError: err => toast.error(err.response?.data?.message || t('errors.failedToUpdateEmployee')),
  });

  const handleSubmit = e => {
    e.preventDefault();
    createMutation.mutate({ full_name: fullName, email, password, role_id: selectedRole });
  };
  const handleEditClick = emp => {
    setEditingEmployee(emp);
    setEditForm({ full_name: emp.full_name || '', email: emp.email || '', role_id: emp.role_id?._id || '', password: '' });
    setEditModalOpen(true);
  };
  const handleUpdate = e => {
    e.preventDefault();
    if (!editingEmployee) return;
    const payload = { full_name: editForm.full_name, email: editForm.email, role_id: editForm.role_id };
    if (editForm.password) payload.password = editForm.password;
    updateMutation.mutate({ id: editingEmployee._id, payload });
  };

  return (
    <>
      <div style={{ padding: 'var(--page-py) var(--page-px)', minHeight: '100dvh' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 className="pm-section-title">{t('common.manageEmployees')}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* ── Create form ── */}
          <div className="pm-form-section" style={{ maxWidth: '24rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem', marginTop: 0 }}>
              {t('common.createNewEmployee')}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="pm-form-group">
                <Label className="pm-label">{t('forms.fullName')} *</Label>
                <Input type="text" className="pm-input" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="pm-form-group">
                <Label className="pm-label">{t('forms.email')} *</Label>
                <Input type="email" className="pm-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="pm-form-group">
                <Label className="pm-label">{t('auth.password')} *</Label>
                <Input type="password" className="pm-input" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="pm-form-group" style={{ marginBottom: '1.5rem' }}>
                <Label className="pm-label">{t('forms.role')} *</Label>
                <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} required
                  className="pm-input pm-input-select">
                  <option value="" disabled>{isLoadingRoles ? 'Loading…' : t('forms.selectRole')}</option>
                  {rolesData?.filter(r => !r.is_owner_role).map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={createMutation.isLoading}
                className="pm-btn pm-btn-primary pm-btn-full">
                {createMutation.isLoading ? t('buttons.creating') : t('buttons.createEmployee')}
              </button>
            </form>
          </div>

          {/* ── Employee table ── */}
          <div>
            {isLoadingEmployees ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {t('common.loadingEmployees')}
              </div>
            ) : (
              <div className="pm-table-wrap">
                <Table className="pm-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('customers.name')}</TableHead>
                      <TableHead>{t('forms.email')}</TableHead>
                      <TableHead>{t('forms.role')}</TableHead>
                      <TableHead style={{ textAlign: 'center' }}>{t('customers.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeesData?.map(emp => (
                      <TableRow key={emp._id}>
                        <TableCell className="pm-td-primary">{emp.full_name}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>
                          <span className={`pm-badge ${emp.role === 'owner' ? 'pm-badge-active' : 'pm-badge-neutral'}`}>
                            {emp.role_id?.name || emp.role}
                          </span>
                        </TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          {emp.role !== 'owner' && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                              <button className="pm-btn pm-btn-ghost pm-btn-sm" title="Edit"
                                onClick={() => handleEditClick(emp)}>
                                <IconEdit size={16} style={{ color: 'var(--info)' }} />
                              </button>
                              <button className="pm-btn pm-btn-ghost pm-btn-sm"
                                onClick={() => setDeleteTarget(emp._id)} disabled={deleteMutation.isLoading}>
                                <IconTrashFilled size={16} style={{ color: 'var(--danger)' }} />
                              </button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem', marginTop: 0 }}>
            {t('common.editEmployee')}
          </h3>
          <form onSubmit={handleUpdate}>
            <div className="pm-form-group">
              <Label className="pm-label">{t('forms.fullName')} *</Label>
              <Input type="text" className="pm-input" value={editForm.full_name}
                onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} required />
            </div>
            <div className="pm-form-group">
              <Label className="pm-label">{t('forms.email')} *</Label>
              <Input type="email" className="pm-input" value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="pm-form-group">
              <Label className="pm-label">{t('forms.newPasswordOptional')}</Label>
              <Input type="password" className="pm-input" value={editForm.password}
                placeholder={t('forms.leaveBlankPassword')}
                onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="pm-form-group" style={{ marginBottom: '1.5rem' }}>
              <Label className="pm-label">{t('forms.role')} *</Label>
              <select value={editForm.role_id}
                onChange={e => setEditForm(p => ({ ...p, role_id: e.target.value }))} required
                className="pm-input pm-input-select">
                <option value="" disabled>{isLoadingRoles ? '…' : t('forms.selectRole')}</option>
                {rolesData?.filter(r => !r.is_owner_role).map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="pm-btn pm-btn-secondary" onClick={() => setEditModalOpen(false)}>
                {t('buttons.cancel')}
              </button>
              <button type="submit" disabled={updateMutation.isLoading} className="pm-btn pm-btn-primary">
                {updateMutation.isLoading ? t('buttons.saving') : t('buttons.saveChanges')}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
        title={t('common.deleteEmployeeTitle')}
        message={t('common.deleteEmployeeMessage')}
        confirmText={deleteMutation.isLoading ? t('customers.deleting') : t('customers.delete')}
      />
    </>
  );
}