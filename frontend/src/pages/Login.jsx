import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaGoogle } from 'react-icons/fa';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
      // Use the result from the login function
      const result = await login(formData); 
      if (result.success) {
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        console.log(result.message);
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-neutral-950 p-4">
      {/* 2. Added 'relative' to this div */}
      <div className="shadow-input relative mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        
        {/* 3. Added the toggle button */}
        
        
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome Back
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Log in to your PawnManager account
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            {/* 4. Added asterisk for consistency */}
            <Label htmlFor="email">Email Address</Label> 
            <Input id="email" name="email" placeholder="owner@citygold.com" type="email" onChange={handleChange} required />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
             {/* 5. Added asterisk for consistency */}
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" placeholder="••••••••" type="password" onChange={handleChange} required />
          </LabelInputContainer>

          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in →'}
            <BottomGradient />
          </button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <div className="flex flex-col space-y-4">
            <button
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              type="button"
              onClick={() => toast.error('Google Sign-in not implemented yet.')}
            >
              <FaGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Log in with Google
              </span>
              <BottomGradient />
            </button>
            
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
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
      {/* 6. FIXED TYPO: w-1.2 is not a valid Tailwind class. Changed to w-1/2 */}
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