import React, { useState, useEffect } from 'react';
import { createPawnTicket, getCustomers } from '../services/api';
import toast from 'react-hot-toast';

export default function NewPawn() {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    ticket_number: '',
    loan_amount: '',
    interest_rate: '3',
    adv_amount: '',
    item_name: '',
    item_weight: '',
  });

  // Fetch customers when the component loads
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data.customers);
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
        }
      ]
    };

    try {
      await createPawnTicket(payload);
      toast.success('Pawn ticket created!');
      // Reset form
      setFormData({
        customer_id: '', ticket_number: '', loan_amount: '', 
        interest_rate: '3', adv_amount: '', item_name: '', item_weight: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create New Pawn Ticket</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
        <label>Customer</label>
        <select name="customer_id" value={formData.customer_id} onChange={handleChange} required>
          <option value="" disabled>
            {loadingCustomers ? 'Loading...' : '-- Select a Customer --'}
          </option>
          {customers.map((cust) => (
            <option key={cust._id} value={cust._id}>
              {cust.full_name} - {cust.phone}
            </option>
          ))}
        </select>

        <label>Ticket Number</label>
        <input type="text" name="ticket_number" value={formData.ticket_number} onChange={handleChange} required />

        <label>Loan Amount (₹)</label>
        <input type="number" name="loan_amount" value={formData.loan_amount} onChange={handleChange} required />

        <label>Interest Rate (%)</label>
        <input type="number" name="interest_rate" value={formData.interest_rate} onChange={handleChange} required />

        <label>Advance Amount (₹) (1st month interest)</label>
        <input type="number" name="adv_amount" value={formData.adv_amount} onChange={handleChange} required />

        <hr />
        <h4>Item Details</h4>
        <label>Item Name</label>
        <input type="text" name="item_name" value={formData.item_name} onChange={handleChange} required />
        
        <label>Item Weight (grams)</label>
        <input type="number" name="item_weight" value={formData.item_weight} onChange={handleChange} required />
        <hr />

        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Saving...' : 'Save Pawn Ticket'}
        </button>
      </form>
    </div>
  );
}