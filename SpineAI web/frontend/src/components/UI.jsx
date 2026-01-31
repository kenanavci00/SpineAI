import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading skeleton component for displaying placeholder content
 * while data is being fetched
 */
export const LoadingSkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  count = 1,
  circle = false,
  className = ''
}) => {
  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`loading-skeleton ${width} ${height} ${circle ? 'rounded-full' : 'rounded-md'} ${
            i !== count - 1 ? 'mb-3' : ''
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Button component with smooth animations
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <span className="animate-spin">⚙️</span>}
      {children}
    </motion.button>
  );
};

/**
 * Input field with label and error display
 */
export const Input = ({ 
  label, 
  error, 
  touched, 
  className = '',
  ...props 
}) => {
  // Handle custom validation messages for email inputs
  const handleInvalid = (e) => {
    e.preventDefault();
    const input = e.target;
    
    if (input.type === 'email') {
      if (input.validity.valueMissing) {
        input.setCustomValidity('Please enter your email address');
      } else if (input.validity.typeMismatch) {
        input.setCustomValidity('Please enter a valid email address (e.g., name@example.com)');
      } else if (input.validity.patternMismatch) {
        input.setCustomValidity('Please include an "@" sign in the email address');
      } else {
        input.setCustomValidity('');
      }
    }
  };

  const handleInput = (e) => {
    e.target.setCustomValidity('');
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && <label className="form-label">{label}</label>}
      <input 
        className={`input-field ${error && touched ? 'border-red-500' : ''} ${className}`}
        onInvalid={handleInvalid}
        onInput={handleInput}
        {...props}
      />
      {error && touched && <span className="error-text">{error}</span>}
    </div>
  );
};

/**
 * Card component with glassmorphism effect
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass glass-dark p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Badge component for displaying status or tags
 */
export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
