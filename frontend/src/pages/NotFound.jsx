import React from 'react';
import { Link } from 'react-router-dom';
import { IconHome, IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative">
            <IconAlertCircle className="h-24 w-24 text-neutral-400 dark:text-neutral-600" />
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-neutral-300 dark:text-neutral-700">
              404
            </span>
          </div>
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">
          Page Not Found
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/app/dashboard"
          className="group/btn relative inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] hover:opacity-90 transition-opacity"
        >
          <IconHome className="h-4 w-4" />
          Go to Dashboard
          <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
        </Link>
      </motion.div>
    </div>
  );
}

