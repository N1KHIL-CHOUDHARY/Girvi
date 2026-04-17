import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getAccounts, deleteAccount } from '../services/api';
import { usePermission } from '../hooks/usePermission';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconCircleArrowLeftFilled, IconCircleArrowRightFilled,
  IconEye, IconTrashFilled, IconEdit, IconPlus,
  IconPhone, IconMapPin, IconSearch, IconX, IconDotsVertical,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Input } from '../components/ui/Input';
import TableSkeleton from '../components/TableSkeleton';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AllCustomers() {
  const { t } = useTranslation();
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState('');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [openMenuId,    setOpenMenuId]    = useState(null);
  const [isSearchOpen,  setIsSearchOpen]  = useState(false);
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => getAccounts(page, search),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  const accounts       = queryData?.data?.customers  || [];
  const totalPages     = queryData?.data?.totalPages    || 1;
  const totalCustomers = queryData?.data?.totalCustomers || 0;

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => { toast.success(t('customers.deletedSuccess')); queryClient.invalidateQueries(['customers']); setDeleteTarget(null); setOpenMenuId(null); },
    onError: err => toast.error(err.response?.data?.message || t('customers.failedToDelete')),
  });

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const goToPage     = n  => { if (n >= 1 && n <= totalPages) setPage(n); };
  const toggleMenu   = id => setOpenMenuId(openMenuId === id ? null : id);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>

      {/* ── Mobile header (fixed) ── */}
      <div style={{ display: 'none' }} className="mobile-header-block">
        {/* rendered via CSS below for screens < md */}
      </div>

      {/* ── Page wrapper ── */}
      <div style={{ padding: 'var(--page-py) var(--page-px)' }}>

        {/* Desktop header */}
        <div className="pm-page-header">
          <div className="pm-page-header-row">
            <div>
              <h1 className="pm-section-title">{t('customers.title')}</h1>
              {!isLoading && (
                <p className="pm-section-subtitle">
                  {t('customers.totalCount', { count: totalCustomers })}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="pm-search-wrap">
                <svg className="pm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <Input
                  type="text" placeholder={t('customers.searchByName')}
                  value={search} onChange={handleSearch}
                  className="pm-input pm-search-input"
                  style={{ width: '16rem' }}
                />
              </div>
              {hasPermission('can_create_customers') && (
                <Link to="/app/customer/add" className="pm-btn pm-btn-primary">
                  <IconPlus size={16} /> {t('customers.newCustomer')}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TableSkeleton />
            </motion.div>
          ) : isError ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="pm-empty">
                <p style={{ color: 'var(--danger-text)', fontWeight: 500 }}>{t('customers.failedToLoad')}</p>
              </div>
            </motion.div>
          ) : accounts.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="pm-empty" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <div className="pm-empty-icon">
                  <IconSearch size={24} />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t('customers.noCustomersFound')}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('customers.tryDifferentSearch')}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Desktop table */}
              <div className="pm-table-wrap" style={{ display: 'none' }} data-desktop-table>
                <Table className="pm-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('customers.name')}</TableHead>
                      <TableHead>{t('forms.phoneNumber')}</TableHead>
                      <TableHead>{t('forms.city')}</TableHead>
                      <TableHead style={{ textAlign: 'center' }}>{t('customers.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map(account => (
                      <TableRow key={account._id}>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                              alt={account.full_name}
                              style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-default)', flexShrink: 0 }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{account.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{account.phone_number}</TableCell>
                        <TableCell>{account.address?.city || '—'}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <Link to={`/app/customer/${account._id}`} className="pm-btn pm-btn-ghost pm-btn-sm" title={t('customers.view')}>
                              <IconEye size={15} style={{ color: 'var(--brand)' }} />
                            </Link>
                            {hasPermission('can_edit_customers') && (
                              <Link to={`/app/customer/update/${account._id}`} className="pm-btn pm-btn-ghost pm-btn-sm">
                                <IconEdit size={15} style={{ color: 'var(--info)' }} />
                              </Link>
                            )}
                            {hasPermission('can_delete_customers') && (
                              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setDeleteTarget(account._id)} disabled={deleteMutation.isLoading}>
                                <IconTrashFilled size={15} style={{ color: 'var(--danger)' }} />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} data-mobile-cards>
                {accounts.map(account => (
                  <motion.div key={account._id} initial={false} animate={{ opacity: 1 }} className="pm-mobile-card">
                    <div className="pm-mobile-card-header">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <img
                          src={account.customer_photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${account.full_name}`}
                          alt={account.full_name}
                          style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-default)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {account.full_name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            <IconPhone size={12} />
                            <span>{account.phone_number}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            <IconMapPin size={12} />
                            <span>{account.address?.city || '—'}{account.address?.pincode && `, ${account.address.pincode}`}</span>
                          </div>
                        </div>

                        {/* Kebab menu */}
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => toggleMenu(account._id)}
                            className="pm-btn pm-btn-ghost pm-btn-sm">
                            <IconDotsVertical size={16} />
                          </button>
                          <AnimatePresence>
                            {openMenuId === account._id && (
                              <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenuId(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                                  transition={{ duration: 0.12 }}
                                  style={{
                                    position: 'absolute', right: 0, top: '100%', marginTop: '0.375rem',
                                    width: '10rem', background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                                    padding: '0.375rem', zIndex: 50,
                                  }}
                                >
                                  <Link to={`/app/customer/${account._id}`} onClick={() => setOpenMenuId(null)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <IconEye size={14} style={{ color: 'var(--brand)' }} />
                                    {t('customers.view')}
                                  </Link>
                                  {hasPermission('can_edit_customers') && (
                                    <Link to={`/app/customer/update/${account._id}`} onClick={() => setOpenMenuId(null)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <IconEdit size={14} style={{ color: 'var(--info)' }} />
                                      {t('customers.edit')}
                                    </Link>
                                  )}
                                  {hasPermission('can_delete_customers') && (
                                    <>
                                      <div style={{ height: '1px', background: 'var(--border-default)', margin: '0.25rem 0' }} />
                                      <button
                                        onClick={() => { setDeleteTarget(account._id); setOpenMenuId(null); }}
                                        disabled={deleteMutation.isLoading}
                                        style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      >
                                        <IconTrashFilled size={14} />
                                        {t('customers.delete')}
                                      </button>
                                    </>
                                  )}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <Link to={`/app/customer/${account._id}`}
                      style={{ display: 'block', textAlign: 'center', padding: '0.625rem 1rem', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-default)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}
                    >
                      {t('customers.viewDetails')}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="pm-pagination" style={{ marginTop: '1.5rem' }}>
            <button onClick={() => goToPage(page - 1)} disabled={page === 1}
              className="pm-btn pm-btn-secondary pm-btn-sm">
              <IconCircleArrowLeftFilled size={18} />
              <span>{t('customers.previous')}</span>
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {t('customers.pageOf', { page, total: totalPages })}
            </span>
            <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
              className="pm-btn pm-btn-secondary pm-btn-sm">
              <span>{t('customers.next')}</span>
              <IconCircleArrowRightFilled size={18} />
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
        title={t('customers.deleteConfirmTitle')}
        message={t('customers.deleteConfirmMessage')}
        confirmText={deleteMutation.isLoading ? t('customers.deleting') : t('customers.delete')}
      />
    </div>
  );
}