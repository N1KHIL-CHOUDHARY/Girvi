import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPawnTicketById, updatePawnTicket } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useTheme } from '../contexts/ThemeContext';

export default function UpdatePawn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null); // Start as null
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState(''); // To display customer name
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchPawnTicket = async () => {
      try {
        const res = await getPawnTicketById(id);
        const data = res.data;
        
        // Set the customer's name for display
        setCustomerName(data.customer_id?.full_name || 'N/A');

        // Populate the form with all fields
        setFormData({
          customer_id: data.customer_id?._id,
          ticket_number: data.ticket_number,
          loan_amount: data.loan_amount,
          interest_rate: data.interest_rate,
          adv_amount: data.adv_amount,
          pawned_date: new Date(data.pawned_date).toISOString().split('T')[0],
          // Get the *first* item from the items array
          item_name: data.items[0]?.name || '',
          item_weight: data.items[0]?.weight_grams || '',
          item_purity: data.items[0]?.purity || '',
          item_description: data.items[0]?.description || '',
        });
      } catch (error) {
        toast.error("Failed to load pawn ticket data");
        navigate('/app/pawns');
      }
    };
    fetchPawnTicket();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        }
      ]
    };

    try {
      await updatePawnTicket(id, payload);
      toast.success('Pawn ticket updated successfully!');
      navigate('/app/pawns');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
        Loading ticket data...
      </div>
    );
  }

  return (
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Update Pawn Ticket
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Editing ticket {formData.ticket_number} for {customerName}.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label>Customer</Label>
            <Input type="text" value={customerName} disabled className="dark:bg-neutral-800" />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">Ticket Number *</Label>
              <Input id="ticket_number" name="ticket_number" type="text" value={formData.ticket_number} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="pawned_date">Pawned Date *</Label>
              <Input id="pawned_date" name="pawned_date" type="date" value={formData.pawned_date} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="loan_amount">Loan Amount (₹) *</Label>
              <Input id="loan_amount" name="loan_amount" type="number" value={formData.loan_amount} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
              <Input id="interest_rate" name="interest_rate" type="number" value={formData.interest_rate} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="adv_amount">Advance Amount (₹) *</Label>
              <Input id="adv_amount" name="adv_amount" type="number" value={formData.adv_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Item Details
          </h3>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="item_name">Item Name *</Label>
            <Input id="item_name" name="item_name" type="text" value={formData.item_name} onChange={handleChange} required />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="item_weight">Weight (grams) *</Label>
              <Input id="item_weight" name="item_weight" type="number" value={formData.item_weight} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="item_purity">Purity (e.g., 22)</Label>
              <Input id="item_purity" name="item_purity" type="number" value={formData.item_purity} onChange={handleChange} />
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="item_description">Item Description</Label>
            <Input id="item_description" name="item_description" type="text" value={formData.item_description} onChange={handleChange} />
          </LabelInputContainer>

          <div className="flex gap-4">
            <Link
              to="/app/pawns"
              className="group/btn relative block h-10 w-full rounded-md bg-gray-100 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 text-center leading-10"
            >
              Cancel
            </Link>
            <button
              className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-blue-600 to-blue-500 font-medium text-white shadow-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper components (copy/pasted from your other pages)
const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);