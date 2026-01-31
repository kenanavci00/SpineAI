/**
 * Validates email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLengthValid = password.length >= 8;

  return {
    isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLengthValid,
    strength: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLengthValid].filter(Boolean).length,
    requirements: {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLengthValid,
    },
  };
};

/**
 * Formats date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats user role for display
 */
export const formatRole = (role) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};
