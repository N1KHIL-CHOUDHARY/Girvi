import React, { useRef, useState } from 'react';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleSdkPromiseRef = useRef(null);
  const { login, loginWithGoogle } = useAuth();
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

  const ensureGoogleSdk = () => {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (!googleSdkPromiseRef.current) {
      googleSdkPromiseRef.current = new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('google-client-script');
        const handleLoad = () => {
          if (window.google?.accounts?.id) {
            resolve();
          } else {
            reject(new Error('Google SDK unavailable after load'));
          }
        };
        const handleError = () => reject(new Error('Failed to load Google SDK'));

        if (existingScript) {
          existingScript.addEventListener('load', handleLoad, { once: true });
          existingScript.addEventListener('error', handleError, { once: true });
        } else {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.id = 'google-client-script';
          script.addEventListener('load', handleLoad, { once: true });
          script.addEventListener('error', handleError, { once: true });
          document.body.appendChild(script);
        }

        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve();
          }
        }, 500);
      });
    }

    return googleSdkPromiseRef.current;
  };

  const getGoogleCredential = (clientId) =>
    new Promise((resolve, reject) => {
      const google = window.google;
      if (!google?.accounts?.id) {
        reject(new Error('Google SDK unavailable'));
        return;
      }

      let handled = false;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          handled = true;
          google.accounts.id.cancel();

          if (response?.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No Google credential returned'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.prompt((notification) => {
        if (handled) return;

        const describeReason = () => {
          if (notification.isNotDisplayed && notification.isNotDisplayed()) {
            return notification.getNotDisplayedReason?.();
          }
          if (notification.isSkippedMoment && notification.isSkippedMoment()) {
            return notification.getSkippedReason?.();
          }
          if (notification.isDismissedMoment && notification.isDismissedMoment()) {
            return notification.getDismissedReason?.();
          }
          return undefined;
        };

        const reason = describeReason();
        reject(new Error(reason || 'Google sign-in was cancelled'));
      });
    });

  const handleGoogleLogin = async () => {
    if (googleLoading || loading) {
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    setGoogleLoading(true);

    try {
      await ensureGoogleSdk();
      const credential = await getGoogleCredential(clientId);
      const result = await loginWithGoogle(credential);

      if (result.success) {
        toast.success('Logged in with Google!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Google login failed');
      }
    } catch (error) {
      toast.error(error?.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
      {/* 2. Added 'relative' to this div */}
      <div className="shadow-input relative  w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
        
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
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <FaGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {googleLoading ? 'Connecting to Google...' : 'Log in with Google'}
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