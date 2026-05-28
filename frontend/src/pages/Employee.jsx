import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEmployees, createEmployee, deleteEmployee, getRoles, updateEmployee } from '../services/api'
import { Input } from '../components/ui/Input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../components/ui/table"
import { Dialog, DialogContent } from '../components/ui/Dialog'
import ConfirmationModal from '../components/ConfirmationModal'
import { IconTrash, IconEdit, IconUsers, IconShieldLock, IconLock, IconUserPlus } from '@tabler/icons-react'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

export default function Employees() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role_id: '',
    password: '',
  })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees().then(res => res.data)
  })

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles().then(res => res.data)
  })

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success(t('common.employeeCreated'))
      queryClient.invalidateQueries(['employees'])
      setFullName('')
      setEmail('')
      setPassword('')
      setSelectedRole('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errors.failedToCreateEmployee'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success(t('common.employeeDeleted'))
      queryClient.invalidateQueries(['employees'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errors.failedToDeleteEmployee'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: () => {
      toast.success(t('common.employeeUpdated'))
      queryClient.invalidateQueries(['employees'])
      setEditModalOpen(false)
      setEditingEmployee(null)
      setEditForm({ full_name: '', email: '', role_id: '', password: '' })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('errors.failedToUpdateEmployee'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate({
      full_name: fullName,
      email,
      password,
      role_id: selectedRole,
    })
  }
  
  const handleDelete = (id) => {
    setDeleteTarget(id)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget)
    }
  }

  const handleEditClick = (emp) => {
    setEditingEmployee(emp)
    setEditForm({
      full_name: emp.full_name || '',
      email: emp.email || '',
      role_id: emp.role_id?._id || '',
      password: '',
    })
    setEditModalOpen(true)
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    if (!editingEmployee) return

    const payload = {
      full_name: editForm.full_name,
      email: editForm.email,
      role_id: editForm.role_id,
    }

    if (editForm.password) {
      payload.password = editForm.password
    }

    updateMutation.mutate({ id: editingEmployee._id, payload })
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9] dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/[0.05] flex items-center justify-center">
            <IconUsers className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white">
              {t('common.manageEmployees')}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Add and manage your staff accounts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-[#121212] p-6 sm:p-8 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
              
              <h3 className="relative z-10 mb-6 text-xl font-medium tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <IconUserPlus className="w-5 h-5 text-zinc-400" />
                {t('common.createNewEmployee')}
              </h3>
              
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <LabelInputContainer>
                  <Label htmlFor="full_name">{t('forms.fullName')}</Label>
                  <Input 
                    id="full_name" 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                  />
                </LabelInputContainer>
                
                <LabelInputContainer>
                  <Label htmlFor="email">{t('forms.email')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="role">{t('forms.role')}</Label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    required
                    className="min-h-[48px] w-full rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all appearance-none cursor-pointer"
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
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="min-h-[48px] w-full rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? t('buttons.creating') : t('buttons.createEmployee')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {isLoadingEmployees ? (
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
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5 pl-6">{t('customers.name')}</TableHead>
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('forms.email')}</TableHead>
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5">{t('forms.role')}</TableHead>
                        <TableHead className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium py-5 text-right pr-6">{t('customers.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {employeesData?.map((emp) => (
                        <TableRow key={emp._id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors border-none">
                          <TableCell className="font-medium text-zinc-900 dark:text-white py-5 pl-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                              {emp.full_name.charAt(0).toUpperCase()}
                            </div>
                            {emp.full_name}
                          </TableCell>
                          <TableCell className="text-zinc-600 dark:text-zinc-400 py-5">
                            {emp.email}
                          </TableCell>
                          <TableCell className="py-5">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono",
                              emp.role === 'owner' 
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20"
                                : "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10"
                            )}>
                              {emp.role === 'owner' && <IconShieldLock className="w-3 h-3 mr-1.5" />}
                              {emp.role_id?.name || emp.role}
                            </span>
                          </TableCell>
                          <TableCell className="py-5 pr-6 text-right">
                            {emp.role === 'owner' ? (
                              <div className="flex justify-end pr-2">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                                  <IconLock className="w-3.5 h-3.5" />
                                  Protected
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  type="button" 
                                  title="Edit" 
                                  onClick={() => handleEditClick(emp)} 
                                  className="flex items-center justify-center w-[36px] h-[36px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <IconEdit className="w-[18px] h-[18px]" />
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleDelete(emp._id)} 
                                  disabled={deleteMutation.isPending} 
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
                  {employeesData?.map((emp) => (
                    <div key={emp._id} className="relative overflow-hidden flex flex-col p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#121212] shadow-sm">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.015),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.015),transparent_50%)] pointer-events-none" />
                      
                      <div className="relative z-10 flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-300 ring-2 ring-white dark:ring-[#121212]">
                            {emp.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-zinc-900 dark:text-white leading-tight">{emp.full_name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{emp.email}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono shrink-0",
                          emp.role === 'owner' 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20"
                            : "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300 border border-zinc-200/60 dark:border-white/10"
                        )}>
                          {emp.role === 'owner' && <IconShieldLock className="w-3 h-3 mr-1.5" />}
                          {emp.role_id?.name || emp.role}
                        </span>
                      </div>

                      {emp.role === 'owner' ? (
                        <div className="relative z-10 pt-4 border-t border-zinc-100 dark:border-white/[0.05] flex justify-center">
                           <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 py-2">
                             <IconLock className="w-3.5 h-3.5" />
                             Protected Account
                           </span>
                        </div>
                      ) : (
                        <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/[0.05]">
                          <button 
                            type="button" 
                            onClick={() => handleEditClick(emp)} 
                            className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-medium"
                          >
                            <IconEdit className="w-4 h-4" />
                            {t('customers.edit')}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(emp._id)} 
                            disabled={deleteMutation.isPending} 
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
              {t('common.editEmployee')}
            </h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <LabelInputContainer>
                <Label htmlFor="edit_full_name">{t('forms.fullName')}</Label>
                <Input
                  id="edit_full_name"
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  required
                  className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="edit_email">{t('forms.email')}</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
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
                  className="min-h-[48px] rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="edit_role">{t('forms.role')}</Label>
                <select
                  id="edit_role"
                  value={editForm.role_id}
                  onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                  required
                  className="min-h-[48px] w-full rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#1A1A1A] px-4 text-sm text-zinc-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white transition-all appearance-none cursor-pointer"
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
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-white/[0.05]">
                <button
                  type="button"
                  className="min-h-[44px] sm:w-auto rounded-xl bg-zinc-100 dark:bg-white/5 px-6 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
                  onClick={() => setEditModalOpen(false)}
                >
                  {t('buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] sm:w-auto rounded-xl bg-zinc-900 dark:bg-white px-6 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? t('buttons.saving') : t('buttons.saveChanges')}
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
        title={t('common.deleteEmployeeTitle')}
        message={t('common.deleteEmployeeMessage')}
        confirmText={deleteMutation.isPending ? t('customers.deleting') : t('customers.delete')}
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