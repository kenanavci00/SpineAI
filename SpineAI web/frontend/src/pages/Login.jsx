import React, { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toastService } from '../components/Toast';
import { loginValidationSchema } from '../utils/validationSchemas';
import { Input, Button, Card } from '../components/UI';

/**
 * Login page component
 * - Email and password form
 * - Form validation with Yup
 * - JWT token handling
 * - Redirect to dashboard on successful login
 */
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();

  // Check if user was redirected from a protected route
  const from = location.state?.from?.pathname || '/dashboard';
  const wasRedirected = location.state?.from;

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  // Show message if redirected from protected route
  useEffect(() => {
    if (wasRedirected) {
      toastService.info('Please log in to perform analysis');
    }
  }, [wasRedirected]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        toastService.success('Login successful!');
        navigate(from, { replace: true });
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
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
        {/* Alert for protected route redirect */}
        {wasRedirected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800 dark:text-blue-300 font-medium">
                Please log in to perform analysis
              </p>
            </div>
          </motion.div>
        )}

        <Card className="p-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-5">
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
            </motion.div>

            {/* Remember me & Forgot password */}
            <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                <span className="text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <Link to="#" className="text-blue-500 hover:text-blue-600 font-medium">
                Forgot password?
              </Link>
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          </motion.div>

          {/* Register link */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
                Register here
              </Link>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
