import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Removed loginWithGoogle
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData); 
      if (result.success) {
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="shadow-input relative w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8">
        
        <h2 className="text-xl font-bold text-neutral-800">
          Welcome Back
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">
          Log in to your PawnManager account
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="email">Email Address</Label> 
            <Input id="email" name="email" placeholder="owner@citygold.com" type="email" inputMode="email" autoComplete="email" enterKeyHint="next" onChange={handleChange} required />
          </LabelInputContainer>

          <LabelInputContainer className="mb-6 md:mb-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" placeholder="••••••••" type="password" autoComplete="current-password" enterKeyHint="done" onChange={handleChange} required />
          </LabelInputContainer>

          <button
            className="group/btn relative block min-h-[44px] w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in →'}
            <BottomGradient />
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-600">
          No account?{' '}
          <Link to="/signup" className="font-bold text-indigo-500 hover:text-indigo-400">
            Sign up
          </Link>
        </p>
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