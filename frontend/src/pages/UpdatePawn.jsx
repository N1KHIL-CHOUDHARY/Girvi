import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPawnTicketById, updatePawnTicket } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useTheme } from '../contexts/ThemeContext';

export default function UpdatePawn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchPawnTicket = async () => {
      try {
        const res = await getPawnTicketById(id);
        const data = res.data;
        setFormData({
          customer_id: data.customer_id._id,
          customer_name: data.customer_id.full_name, // For display
          ticket_number: data.ticket_number,
          loan_amount: data.loan_amount,
          interest_rate: data.interest_rate,
          adv_amount: data.adv_amount,
          pawned_date: new Date(data.pawned_date).toISOString().split('T')[0],
          // Just get the first item for this form
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
      toast.success('Pawn ticket updated!');
      navigate('/app/pawns');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return <div>Loading Ticket...</div>; // You can replace this with a skeleton
  }

  return (
    <div className={`w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="shadow-input mx-auto w-full max-w-2xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Update Pawn Ticket
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Editing ticket {formData.ticket_number} for {formData.customer_name}.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          {/* (You can copy your full form from NewPawn.jsx here) */}
          {/* (I am showing a simplified version) */}
          
          <LabelInputContainer className="mb-4">
            <Label>Customer</Label>
            <Input type="text" value={formData.customer_name} disabled />
          </LabelInputContainer>

          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="ticket_number">Ticket Number *</Label>
              <Input id="ticket_number" name="ticket_number" type="text" value={formData.ticket_number} onChange={handleChange} required />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="loan_amount">Loan Amount (₹) *</Label>
              <Input id="loan_amount" name="loan_amount" type="number" value={formData.loan_amount} onChange={handleChange} required />
            </LabelInputContainer>
          </div>
          
          {/* (Add all other item fields: weight, purity, etc.) */}

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-blue-600 to-blue-500 font-medium text-white"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

// (You need to paste the BottomGradient and LabelInputContainer components here
// just like in your NewPawn.jsx file)

const BottomGradient = () => ( <>...</> );
const LabelInputContainer = ({ children, className }) => ( <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div> );