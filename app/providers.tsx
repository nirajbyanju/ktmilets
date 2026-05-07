// components/ToastProvider.tsx
'use client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect } from 'react';

type ToastProviderProps = {
  children: React.ReactNode;
};

export default function ToastProvider({ children }: ToastProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const originalToastError = toast.error.bind(toast);

    (toast as typeof toast & { error: typeof toast.error }).error = ((...args: Parameters<typeof toast.error>) => {
      void args;
      return undefined as ReturnType<typeof toast.error>;
    }) as typeof toast.error;

    return () => {
      (toast as typeof toast & { error: typeof toast.error }).error = originalToastError;
    };
  }, []);

  return (
    <>
      {children}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
