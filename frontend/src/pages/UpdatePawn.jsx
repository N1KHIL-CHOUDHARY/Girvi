import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPawnTicketById, updatePawnTicket } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function UpdatePawn() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(null);
  const [customerName, setCustomerName] = useState('');

  // ✅ Fetch pawn ticket using React Query
  const {
    data: pawnData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pawnTicket', id],
    queryFn: async () => {
      const res = await getPawnTicketById(id);
      return res.data;
    },
    onError: () => {
      toast.error(t('errors.failedToLoadCustomer'));
      navigate('/app/pawns');
    },
  });

  // Initialize form once data is fetched
  useEffect(() => {
    if (pawnData) {
      setCustomerName(pawnData.customer_id?.full_name || 'N/A');
      setFormData({
        customer_id: pawnData.customer_id?._id,
        ticket_number: pawnData.ticket_number,
        loan_amount: pawnData.loan_amount,
        interest_rate: pawnData.interest_rate,
        adv_amount: pawnData.adv_amount,
        pawned_date: new Date(pawnData.pawned_date).toISOString().split('T')[0],
        item_name: pawnData.items[0]?.name || '',
        item_weight: pawnData.items[0]?.weight_grams || '',
        item_purity: pawnData.items[0]?.purity || '',
        item_description: pawnData.items[0]?.description || '',
      });
    }
  }, [pawnData]);

  // ✅ Mutation for updating pawn ticket
  const updateMutation = useMutation({
    mutationFn: (payload) => updatePawnTicket(id, payload),
    onSuccess: () => {
      toast.success(t('loans.updateSuccess'));
      queryClient.invalidateQueries(['pawnTickets']); // refresh pawn list
      queryClient.invalidateQueries(['pawnTicket', id]); // refresh this ticket
      navigate('/app/pawns');
    },
    onError: (error) => {
      const message = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      t('loans.updateFailed');
      
  
    toast.error(message.replace(/"/g, ''));
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData) return;

    const payload = {
      customer_id: formData.customer_id,
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

    updateMutation.mutate(payload);
  };

  if (isLoading || !formData) {
    return (
      <div className="text-center py-20 text-neutral-500 text-neutral-400">
        {t('common.loadingTicketData')}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        {t('common.failedToLoadTicket')}
        <br />
        <Link to="/app/pawns" className="text-blue-500 underline">
          {t('buttons.goBack')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 ">
        <h2 className="text-xl font-bold text-neutral-800 ">
          {t('common.updatePawnTicket')}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 ">
          {t('common.editingTicketFor', { ticket: formData.ticket_number, name: customerName })}
        </p>

        <form className="my-8 pb-40 md:pb-0" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-6 md:mb-4">
            <Label>{t('common.customerLabel')}</Label>
            <Input type="text" value={customerName} disabled className="text-black" />
          </LabelInputContainer>

          {/* Ticket Info */}
          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">{t('loans.ticketNumberLabel')} *</Label>
              <Input id="ticket_number" name="ticket_number" type="text" autoComplete="off" enterKeyHint="next" value={formData.ticket_number} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pawned_date">{t('loans.pawnedDate')} *</Label>
              <Input id="pawned_date" name="pawned_date" type="date" enterKeyHint="next" value={formData.pawned_date} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          {/* Loan Info */}
          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="loan_amount">{t('loans.loanAmountLabel')} *</Label>
              <Input id="loan_amount" name="loan_amount" type="number" inputMode="decimal" enterKeyHint="next" value={formData.loan_amount} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="interest_rate">{t('loans.interestRate')} *</Label>
              <Input id="interest_rate" name="interest_rate" type="number" inputMode="decimal" enterKeyHint="next" value={formData.interest_rate} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount">{t('loans.advanceAmount')} *</Label>
              <Input id="adv_amount" name="adv_amount" type="number" inputMode="decimal" enterKeyHint="next" value={formData.adv_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent via-neutral-700" />

          {/* Item Info */}
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t('loans.itemDetails')}
          </h3>

          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="item_name">{t('loans.itemName')} *</Label>
            <Input id="item_name" name="item_name" type="text" autoComplete="off" enterKeyHint="next" value={formData.item_name} onChange={handleChange} required />
          </LabelInputContainer>

          <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="item_weight">{t('loans.weightGrams')} *</Label>
              <Input id="item_weight" name="item_weight" type="number" inputMode="decimal" enterKeyHint="next" value={formData.item_weight} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity">{t('loans.purity')} (e.g., 22)</Label>
              <Input id="item_purity" name="item_purity" type="number" inputMode="numeric" enterKeyHint="next" value={formData.item_purity} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8 md:mb-8">
            <Label htmlFor="item_description">{t('loans.itemDescription')}</Label>
            <Input id="item_description" name="item_description" type="text" autoComplete="off" enterKeyHint="done" value={formData.item_description} onChange={handleChange} />
          </LabelInputContainer>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <Link
              to="/app/pawns"
              className="group/btn relative block min-h-[44px] w-full md:w-auto rounded-md bg-gray-100 font-medium text-neutral-700   text-center leading-[44px] md:leading-10"
            >
              {t('buttons.cancel')}
            </Link>
            <button
              className="group/btn relative block min-h-[44px] w-full md:w-auto rounded-md bg-gradient-to-br from-blue-600 to-blue-500 font-medium text-white shadow-lg"
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('buttons.saving') : t('buttons.saveChanges')}
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper components
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-2 w-full', className)}>
    {children}
  </div>
);
