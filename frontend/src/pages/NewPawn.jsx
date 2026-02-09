import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createPawnTicket } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils.js';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';

const initialState = {
  ticket_number: '',
  loan_amount: '',
  interest_rate: '3',
  adv_amount: '',
  item_name: '',
  item_weight: '',
  item_purity: '22',
  item_description: '',
  pawned_date: new Date().toISOString().split('T')[0],
};

export default function NewPawn() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: customersData,
    isFetching: loadingCustomers,
  } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: async () => {
      const res = await getAccounts(1, customerSearch);
      return res.data.customers || [];
    },
    enabled: customerSearch.trim().length > 0,
    staleTime: 1000 * 60,
    onError: () => toast.error(t('errors.failedToSearchCustomers')),
  });

  const customers = customersData || [];

  const createPawnMutation = useMutation({
    mutationFn: (payload) => createPawnTicket(payload),
    onSuccess: () => {
      toast.success(t('loans.createSuccess'));
      queryClient.invalidateQueries(['pawnTickets']);
      setFormData(initialState);
      setSelectedCustomer(null);
      setCustomerSearch('');
      navigate('/app/pawns');
    },
    onError: (error) => {
      const message = 
        error.response?.data?.error || 
        error.response?.data?.message || 
        t('loans.createFailed');
        
    
      toast.error(message.replace(/"/g, ''));
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (customerSearch.trim() === '') {
      setIsDropdownOpen(false);
      return;
    }
    const timeout = setTimeout(() => {
      if (customers.length > 0) setIsDropdownOpen(true);
    }, 200);
    return () => clearTimeout(timeout);
  }, [customerSearch, customers]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };

      if (name === 'loan_amount' || name === 'interest_rate') {
        const loan = parseFloat(name === 'loan_amount' ? value : newFormData.loan_amount);
        const rate = parseFloat(name === 'interest_rate' ? value : newFormData.interest_rate);

        if (loan > 0 && rate > 0) {
          const advance = (loan * rate) / 100;
          newFormData.adv_amount = Math.round(advance).toString();
        } else {
          newFormData.adv_amount = '';
        }
      }
      return newFormData;
    });
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.full_name);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error(t('loans.pleaseSelectCustomer'));
      return;
    }

    const payload = {
      customer_id: selectedCustomer._id,
      ticket_number: formData.ticket_number,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      adv_amount: parseFloat(formData.adv_amount),
      pawned_date: formData.pawned_date,
      items: [
        {
          name: formData.item_name,
          weight_grams: parseFloat(formData.item_weight),
          purity: parseFloat(formData.item_purity),
          description: formData.item_description,
        },
      ],
    };

    createPawnMutation.mutate(payload);
  };

  return (
    <div className="w-full">
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 text-neutral-200">
          {t('common.createNewPawnTicket')}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 text-neutral-300">
          {t('common.createPawnDescription')}
        </p>

        <form className="my-8 pb-40 md:pb-0" onSubmit={handleSubmit}>
          <div className="relative" ref={dropdownRef}>
            <LabelInputContainer className="mb-6 md:mb-4">
              <Label htmlFor="customer_search">{t('loans.searchCustomer')}</Label>
              <Input
                id="customer_search"
                type="text"
                placeholder={t('loans.searchCustomerPlaceholder')}
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setIsDropdownOpen(true);
                }}
                required
                autoComplete="off"
                enterKeyHint="search"
              />
            </LabelInputContainer>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto scroll-contain rounded-md bg-white shadow-lg border border-neutral-200 ">
                {loadingCustomers ? (
                  <div className="p-4 text-center text-sm text-neutral-500">{t('loans.loading')}</div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <div
                      key={customer._id}
                      className="p-3 hover:bg-neutral-100 cursor-pointer"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <p className="font-medium text-neutral-800 ">{customer.full_name}</p>
                      <p className="text-sm text-neutral-500 ">{customer.phone_number}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-neutral-500">{t('loans.noCustomersFound')}</div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">{t('loans.ticketNumberLabel')}</Label>
              <Input id="ticket_number" name="ticket_number" placeholder={t('common.placeholderTicket')} type="text" autoComplete="off" enterKeyHint="next" value={formData.ticket_number} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pawned_date">{t('loans.pawnedDate')}</Label>
              <Input id="pawned_date" name="pawned_date" type="date" enterKeyHint="next" value={formData.pawned_date} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="loan_amount">{t('loans.loanAmountLabel')}</Label>
              <Input id="loan_amount" name="loan_amount" placeholder={t('common.placeholderLoan')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.loan_amount} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="interest_rate">{t('loans.interestRate')}</Label>
              <Input id="interest_rate" name="interest_rate" placeholder={t('common.placeholderInterest')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.interest_rate} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount">{t('loans.advanceAmount')}</Label>
              <Input id="adv_amount" name="adv_amount" placeholder={t('common.placeholderAdvance')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.adv_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent via-neutral-700" />

          <h3 className="text-lg font-semibold text-neutral-800 text-neutral-200 mb-4">{t('loans.itemDetails')}</h3>

          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="item_name">{t('loans.itemName')}  </Label>
            <Input id="item_name" name="item_name" placeholder={t('common.placeholderItemName')} type="text" autoComplete="off" enterKeyHint="next" value={formData.item_name} onChange={handleChange} required />
          </LabelInputContainer>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="item_weight">{t('loans.weightGrams')}</Label>
              <Input id="item_weight" name="item_weight" placeholder={t('common.placeholderWeight')} type="number" inputMode="decimal" enterKeyHint="next" value={formData.item_weight} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity">{t('loans.purity')}</Label>
              <Input id="item_purity" name="item_purity" placeholder="22" type="number" inputMode="numeric" enterKeyHint="next" value={formData.item_purity} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8 md:mb-8">
            <Label htmlFor="item_description">{t('loans.itemDescription')}</Label>
            <Input id="item_description" name="item_description" placeholder={t('common.placeholderItemDesc')} type="text" autoComplete="off" enterKeyHint="done" value={formData.item_description} onChange={handleChange} />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] bg-zinc-800 from-zinc-900 to-zinc-900 shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={createPawnMutation.isPending}
          >
            {createPawnMutation.isPending ? t('buttons.saving') : t('loans.savePawnTicket')}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>{children}</div>
);