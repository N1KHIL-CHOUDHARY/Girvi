import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createPawnTicket } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
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
  const [formData, setFormData] = useState(initialState);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
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
    onError: () => toast.error('Failed to search customers'),
  });

  const customers = customersData || [];

  const createPawnMutation = useMutation({
    mutationFn: (payload) => createPawnTicket(payload),
    onSuccess: () => {
      toast.success('Pawn ticket created successfully!');
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
        'Failed to create pawn ticket';
        
    
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
      toast.error('Please select a customer before creating a ticket');
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
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Create New Pawn Ticket
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Create a new loan for a customer.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="relative" ref={dropdownRef}>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="customer_search">Search Customer</Label>
              <Input
                id="customer_search"
                type="text"
                placeholder="Start typing a customer's name..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setIsDropdownOpen(true);
                }}
                required
                autoComplete="off"
              />
            </LabelInputContainer>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-md bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700">
                {loadingCustomers ? (
                  <div className="p-4 text-center text-sm text-neutral-500">Loading...</div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <div
                      key={customer._id}
                      className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <p className="font-medium text-neutral-800 dark:text-neutral-200">{customer.full_name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{customer.phone_number}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-neutral-500">No customers found.</div>
                )}
              </div>
            )}
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">Ticket Number</Label>
              <Input id="ticket_number" name="ticket_number" placeholder="TICKET-1001" type="text" value={formData.ticket_number} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pawned_date">Pawned Date</Label>
              <Input id="pawned_date" name="pawned_date" type="date" value={formData.pawned_date} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="loan_amount">Loan Amount (₹)</Label>
              <Input id="loan_amount" name="loan_amount" placeholder="5000" type="number" value={formData.loan_amount} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="interest_rate">Interest Rate (%)</Label>
              <Input id="interest_rate" name="interest_rate" placeholder="3" type="number" value={formData.interest_rate} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount">Advance Amount (₹)</Label>
              <Input id="adv_amount" name="adv_amount" placeholder="150" type="number" value={formData.adv_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Item Details</h3>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="item_name">Item Name *</Label>
            <Input id="item_name" name="item_name" placeholder="Gold Chain" type="text" value={formData.item_name} onChange={handleChange} required />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="item_weight">Weight (grams) *</Label>
              <Input id="item_weight" name="item_weight" placeholder="10.5" type="number" value={formData.item_weight} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity">Purity</Label>
              <Input id="item_purity" name="item_purity" placeholder="22" type="number" value={formData.item_purity} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="item_description">Item Description</Label>
            <Input id="item_description" name="item_description" placeholder="22ct gold chain with small locket" type="text" value={formData.item_description} onChange={handleChange} />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={createPawnMutation.isPending}
          >
            {createPawnMutation.isPending ? 'Saving...' : 'Save Pawn Ticket'}
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