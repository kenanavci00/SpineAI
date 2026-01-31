import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Toast service for displaying notifications
 */
export const toastService = {
  success: (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        borderRadius: '10px',
        background: '#10b981',
        color: '#fff',
      },
    });
  },

  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        borderRadius: '10px',
        background: '#ef4444',
        color: '#fff',
      },
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        position: 'top-right',
      }
    );
  },

  dismiss: (id) => {
    toast.dismiss(id);
  },
};

/**
 * Toast provider component wrapper
 */
export const ToastProvider = ({ children }) => {
  return children;
};
