import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoles, createRole, deleteRole, updateRole } from '../services/api'
import { Input } from '../components/ui/Input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table"
import { Dialog, DialogContent } from '../components/ui/Dialog'
import ConfirmationModal from '../components/ConfirmationModal'
import { IconTrash, IconEdit, IconShieldLock, IconShieldCheck, IconLock } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'

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
}

const formatLabel = (key) => {
  return key.replace('can_', '').replace(/_/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())
}

export default function Roles() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const [roleName, setRoleName] = useState('')
  const [permissions, setPermissions] = useState(initialPermissions)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [editPermissions, setEditPermissions] = useState(initialPermissions)
  const [editRoleName, setEditRoleName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles().then(res => res.data)
  })

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success(t('common.roleCreated'))
      queryClient.invalidateQueries(['roles'])
      setRoleName('')
      setPermissions(initialPermissions)
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToCreateRole')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success(t('common.roleDeleted'))
      queryClient.invalidateQueries(['roles'])
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.cannotDeleteRoleInUse')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => {
      toast.success(t('common.roleUpdated'))
      queryClient.invalidateQueries(['roles'])
      setEditModalOpen(false)
      setEditingRole(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || t('errors.failedToUpdateRole')),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({ name: roleName, permissions })
  }

  const handlePermissionChange = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const handleDelete = (id) => {
    setDeleteTarget(id)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget)
    }
  }

  const handleEditClick = (role) => {
    setEditingRole(role)
    setEditRoleName(role.name)
    setEditPermissions(role.permissions || initialPermissions)
    setEditModalOpen(true)
  }

  const handleEditPermissionChange = (key) => {
    setEditPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!editingRole) return
    updateMutation.mutate({
      id: editingRole._id,
      payload: { name: editRoleName, permissions: editPermissions },
    })
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] flex items-center justify-center">
            <IconShieldCheck className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white">
              {t('common.rolesAndPermissions')}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage system access and staff permissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 sm:p-8 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
              
              <h3 className="relative z-10 mb-6 text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
                {t('common.createNewRole')}
              </h3>
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <LabelInputContainer>
                  <Label htmlFor="role_name">{t('forms.roleName')}</Label>
                  <Input 
                    id="role_name" 
                    type="text" 
                    value={roleName} 
                    onChange={(e) => setRoleName(e.target.value)} 
                    required 
                    className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                  />
                </LabelInputContainer>
                
                <div className="space-y-4 border-t border-zinc-100 dark:border-white/[0.05] pt-6">
                  <Label>{t('forms.permissions')}</Label>
                  <div className="max-h-[40vh] overflow-y-auto scroll-contain space-y-3 pr-2">
                    {Object.keys(permissions).map((key) => (
                      <label key={key} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-zinc-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{formatLabel(key)}</span>
                        <input
                          type="checkbox"
                          id={key}
                          checked={permissions[key]}
                          onChange={() => handlePermissionChange(key)}
                          className="h-5 w-5 rounded-md border-zinc-300 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-zinc-900 dark:text-white focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-0 cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="min-h-[48px] w-full rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                    disabled={createMutation.isLoading}
                  >
                    {createMutation.isLoading ? t('buttons.creating') : t('buttons.createRole')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-8 animate-pulse min-h-[400px]">
                <div className="h-6 bg-zinc-200 dark:bg-white/5 rounded w-1/4 mb-8" />
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-white/[0.02] rounded-xl" />)}
                </div>
              </div>
            ) : (
              <>
                <div className="hidden md:block rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                      <TableRow className="border-zinc-200/60 dark:border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5 pl-6">{t('forms.roleName')}</TableHead>
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('forms.permissions')}</TableHead>
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5 text-right pr-6">{t('customers.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {rolesData?.map((role) => (
                        <TableRow key={role._id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors border-none">
                          <TableCell className="font-medium text-zinc-900 dark:text-white py-5 pl-6 flex items-center gap-2">
                            {role.is_owner_role && <IconShieldLock className="w-4 h-4 text-emerald-500" />}
                            {role.name}
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/5 text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
                              {t('common.activePermissions', { count: Object.keys(role.permissions).filter(k => role.permissions[k] === true).length })}
                            </span>
                          </TableCell>
                          <TableCell className="py-5 pr-6 text-right">
                            {role.is_owner_role ? (
                              <div className="flex justify-end pr-2">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                                  <IconLock className="w-3.5 h-3.5" />
                                  {t('common.locked')}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  type="button" 
                                  title="Edit" 
                                  onClick={() => handleEditClick(role)} 
                                  className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <IconEdit className="w-[18px] h-[18px]" />
                                </button>
                                <button 
                                  type="button" 
                                  title="Delete"
                                  onClick={() => handleDelete(role._id)} 
                                  disabled={deleteMutation.isLoading} 
                                  className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
                                >
                                  <IconTrash className="w-[18px] h-[18px]" />
                                </button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-4">
                  {rolesData?.map((role) => (
                    <div key={role._id} className="relative overflow-hidden flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] shadow-sm">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
                      
                      <div className="relative z-10 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           {role.is_owner_role && <IconShieldLock className="w-5 h-5 text-emerald-500" />}
                           <h3 className="text-lg font-medium text-zinc-900 dark:text-white">{role.name}</h3>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                          {t('common.activePermissions', { count: Object.keys(role.permissions).filter(k => role.permissions[k] === true).length })}
                        </span>
                      </div>

                      {role.is_owner_role ? (
                        <div className="relative z-10 pt-4 border-t border-zinc-100 dark:border-white/[0.05] flex justify-center">
                           <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 py-2">
                             <IconLock className="w-3.5 h-3.5" />
                             {t('common.locked')}
                           </span>
                        </div>
                      ) : (
                        <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/[0.05]">
                          <button 
                            type="button" 
                            onClick={() => handleEditClick(role)} 
                            className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium"
                          >
                            <IconEdit className="w-4 h-4" />
                            {t('customers.edit')}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(role._id)} 
                            disabled={deleteMutation.isLoading} 
                            className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            <IconTrash className="w-4 h-4" />
                            {t('customers.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#121212] border-zinc-200 dark:border-white/[0.08] p-0 overflow-hidden rounded-[2rem]">
          <div className="p-6 sm:p-8">
            <h3 className="mb-6 text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
              {t('common.editRole')}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <LabelInputContainer>
                <Label htmlFor="edit_role_name">{t('forms.roleName')}</Label>
                <Input
                  id="edit_role_name"
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  required
                  className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                />
              </LabelInputContainer>
              <div className="space-y-4">
                <Label>{t('forms.permissions')}</Label>
                <div className="max-h-60 overflow-y-auto scroll-contain space-y-3 pr-2">
                  {Object.keys(editPermissions).map((key) => (
                    <label key={key} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-zinc-50 dark:hover:bg-white/[0.02] rounded-xl transition-colors">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{formatLabel(key)}</span>
                      <input
                        type="checkbox"
                        id={`edit_${key}`}
                        checked={editPermissions[key]}
                        onChange={() => handleEditPermissionChange(key)}
                        className="h-5 w-5 rounded-md border-zinc-300 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-zinc-900 dark:text-white focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-0 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-white/[0.05]">
                <button
                  type="button"
                  className="min-h-[44px] sm:w-auto rounded-xl bg-zinc-100 dark:bg-white/5 px-6 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] sm:w-auto rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
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
    </div>
  )
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2.5 w-full", className)}>
      {children}
    </div>
  )
}

const Label = ({ children, htmlFor, className }) => (
  <label htmlFor={htmlFor} className={cn("text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400", className)}>
    {children}
  </label>
)