import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    shop_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const { signup } = useAuth();
  const navigate = useNavigate();

  const firstNameRef = useRef(null);
  const emailRef   = useRef(null);

  const isMobileViewport = () =>
    typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStepOne = () => {
    const { firstname, lastname, shop_name } = formData;
    if (!firstname.trim() || !lastname.trim() || !shop_name.trim()) {
      toast.error('Please fill in your name and shop details.');
      return false;
    }
    return true;
  };

  const goToStepTwo = () => {
    if (!validateStepOne()) return;
    setStep(2);
  };

  useEffect(() => {
    if (!isMobileViewport()) return;

    if (step === 1 && firstNameRef.current) {
      firstNameRef.current.focus();
    }

    if (step === 2 && emailRef.current) {
      emailRef.current.focus();
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // On mobile, prevent submitting from step 1 and move to step 2 instead
    if (isMobileViewport() && step === 1) {
      goToStepTwo();
      return;
    }

    setLoading(true);

    const payload = {
      full_name: `${formData.firstname} ${formData.lastname}`,
      shop_name: formData.shop_name,
      email: formData.email,
      password: formData.password,
    };
    try {
      const result = await signup(payload);
      if (result.success) {
        toast.success('Signup successful! Welcome.');
        navigate('/app/dashboard');
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="shadow-input relative mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8">
        <h2 className="text-xl font-bold text-neutral-800">
          Welcome to PawnManager
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">
          Create your account to start managing your shop
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-4 md:hidden flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Step {step} of 2</span>
            <span>{step === 1 ? 'Basic details' : 'Account security'}</span>
          </div>

          {/* Step 1 - Name & shop (always visible on desktop) */}
          <div
            className={cn(
              'md:mb-4',
              step === 1 ? 'block' : 'hidden',
              'md:block'
            )}
          >
            <div className="mb-6 md:mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer>
                <Label htmlFor="firstname">First name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  placeholder="John"
                  type="text"
                  autoComplete="given-name"
                  enterKeyHint="next"
                  onChange={handleChange}
                  required
                  ref={firstNameRef}
                  className="min-h-[44px]"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last name</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  placeholder="Doe"
                  type="text"
                  autoComplete="family-name"
                  enterKeyHint="next"
                  onChange={handleChange}
                  required
                  className="min-h-[44px]"
                />
              </LabelInputContainer>
            </div>

            <LabelInputContainer className="mb-6 md:mb-4">
              <Label htmlFor="shop_name">Shop Name</Label>
              <Input
                id="shop_name"
                name="shop_name"
                placeholder="City Gold Pawn"
                type="text"
                autoComplete="organization"
                enterKeyHint="next"
                onChange={handleChange}
                required
                className="min-h-[44px]"
              />
            </LabelInputContainer>
          </div>

          {/* Step 2 - Email & password (always visible on desktop) */}
          <div
            className={cn(
              'md:mb-4',
              step === 2 ? 'block' : 'hidden',
              'md:block'
            )}
          >
            <LabelInputContainer className="mb-6 md:mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="owner@citygold.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                enterKeyHint="next"
                onChange={handleChange}
                required
                ref={emailRef}
                className="min-h-[44px]"
              />
            </LabelInputContainer>

            <LabelInputContainer className="mb-6 md:mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                enterKeyHint="done"
                onChange={handleChange}
                required
                className="min-h-[44px]"
              />
            </LabelInputContainer>
          </div>

          {/* Mobile actions */}
          <div className="mt-2 md:mt-0 md:hidden">
            {step === 1 ? (
              <button
                type="button"
                onClick={goToStepTwo}
                className="group/btn relative block min-h-[44px] w-full rounded-md bg-linear-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
                disabled={loading}
              >
                Next
                <BottomGradient />
              </button>
            ) : (
              <button
                className="group/btn relative block min-h-[44px] w-full rounded-md bg-linear-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <BottomGradient />
              </button>
            )}
          </div>

          {/* Desktop submit */}
          <div className="mt-4 hidden md:block">
            <button
              className="group/btn relative block min-h-[44px] w-full rounded-md bg-linear-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign up →'}
              <BottomGradient />
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-500 hover:text-indigo-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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