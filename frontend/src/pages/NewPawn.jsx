import React, { useState, useEffect } from 'react';
import { createPawnTicket, getCustomers } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useTheme } from '../contexts/ThemeContext';

const initialState = {
  customer_id: '',
  ticket_number: '',
  loan_amount: '',
  interest_rate: '3',
  adv_amount: '',
  item_name: '',
  item_weight: '',
  item_purity: '22',
  item_description: '',
};

export default function NewPawn() {
  const [formData, setFormData] = useState(initialState);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        if (Array.isArray(res.data)) { // Use res.data directly
          setCustomers(res.data);
        } else if (Array.isArray(res.data.customers)) { // Fallback for {count, customers}
          setCustomers(res.data.customers);
        }
      } catch (error) {
        toast.error('Failed to load customers');
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    setLoading(true);

    const payload = {
      customer_id: formData.customer_id,
      ticket_number: formData.ticket_number,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      adv_amount: parseFloat(formData.adv_amount),
      items: [
        {
          name: formData.item_name,
          weight_grams: parseFloat(formData.item_weight),
          purity: parseFloat(formData.item_purity),
          description: formData.item_description,
        }
      ]
    };

    try {
      await createPawnTicket(payload);
      toast.success('Pawn ticket created!');
      setFormData(initialState); // Reset the form
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
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
          <LabelInputContainer className="mb-4">
            <Label htmlFor="customer_id">Customer *</Label>
            <select
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              className={cn(
                `flex h-10 w-full rounded-md border border-neutral-300 bg-gray-50 px-3 py-2 text-sm
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200`
              )}
            >
              <option value="" disabled>
                {loadingCustomers ? 'Loading customers...' : '-- Select a Customer --'}
              </option>
              {customers.map((cust) => (
                <option key={cust._id} value={cust._id}>
                  {cust.full_name} - {cust.phone_number}
                </option>
              ))}
            </select>
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">Ticket Number *</Label>
              <Input id="ticket_number" name="ticket_number" placeholder="TICKET-1001" type="text" value={formData.ticket_number} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="loan_amount">Loan Amount (₹) *</Label>
              <Input id="loan_amount" name="loan_amount" placeholder="5000" type="number" value={formData.loan_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
              <Input id="interest_rate" name="interest_rate" placeholder="3" type="number" value={formData.interest_rate} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount">Advance Amount (₹) *</Label>
              <Input id="adv_amount" name="adv_amount" placeholder="150" type="number" value={formData.adv_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Item Details
          </h3>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="item_name">Item Name *</Label>
            <Input id="item_name" name="item_name" placeholder="Gold Chain" type="text" value={formData.item_name} onChange={handleChange} required />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="item_weight">Weight (grams) *</Label>
              <Input id="item_weight" name="item_weight" placeholder="10.5" type="number" value={formData.item_weight} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity">Purity (e.g., 22)</Label>
              <Input id="item_purity" name="item_purity" placeholder="22" type="number" value={formData.item_purity} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="item_description">Item Description</Label>
            <Input id="item_description" name="item_description" placeholder="22ct gold chain with small locket" type="text" value={formData.item_description} onChange={handleChange} />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#2727a_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Pawn Ticket'}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};