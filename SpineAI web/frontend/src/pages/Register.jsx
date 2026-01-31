import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toastService } from '../components/Toast';
import { registerValidationSchema } from '../utils/validationSchemas';
import { Input, Button, Card } from '../components/UI';

/**
 * Register page component
 * - Email, username, password fields
 * - Password strength validation
 * - Password confirmation
 * - Form validation with Formik + Yup
 * - Redirect to login on successful registration
 */
const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        await register(registerData);
        toastService.success('Registration successful! Welcome to SpineAI');
        navigate('/dashboard');
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed. Please try again.';
        toastService.error(message);
      }
    },
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent mb-2">
              Join SpineAI
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Username field */}
            <motion.div variants={itemVariants}>
              <Input
                label="Username"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.username}
                touched={formik.touched.username}
              />
            </motion.div>

            {/* Email field */}
            <motion.div variants={itemVariants}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.email}
                touched={formik.touched.email}
              />
            </motion.div>

            {/* Password field */}
            <motion.div variants={itemVariants}>
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.password}
                touched={formik.touched.password}
              />
              {formik.values.password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-gray-600 dark:text-gray-400"
                >
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>At least 8 characters</li>
                    <li>Uppercase and lowercase letters</li>
                    <li>Number and special character (@$!%*?&)</li>
                  </ul>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm password field */}
            <motion.div variants={itemVariants}>
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.confirmPassword}
                touched={formik.touched.confirmPassword}
              />
            </motion.div>

            {/* Terms checkbox */}
            <motion.div variants={itemVariants} className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded border-gray-300 dark:border-gray-600" required />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link to="#" className="text-blue-500 hover:text-blue-600 font-medium">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="#" className="text-blue-500 hover:text-blue-600 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          {/* Login link */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-500 hover:text-purple-600 font-semibold">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
