import React from 'react';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toastService } from '../components/Toast';
import { profileValidationSchema } from '../utils/validationSchemas';
import { Input, Button, Card } from '../components/UI';
import { formatDate } from '../utils/validation';

/**
 * Profile page component (protected route)
 * - Display user information
 * - Update profile details
 * - Change password
 */
const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [profileImage, setProfileImage] = React.useState(user?.profileImage || null);
  const [imageFile, setImageFile] = React.useState(null);

  // Update profile image when user changes
  React.useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(`http://localhost:5000${user.profileImage}`);
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach(key => formData.append(key, values[key]));
        if (imageFile) {
          formData.append('profileImage', imageFile);
        }
        await updateProfile(formData);
        toastService.success('Profile updated successfully!');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update profile';
        toastService.error(message);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toastService.error('Only JPEG, JPG and PNG formats are supported');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toastService.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
          </motion.div>

          {/* Profile Info Card */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <label htmlFor="profile-image-input" className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-2 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {user?.role || 'user'} • Joined {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Edit Profile</h3>
              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Username */}
                  <Input
                    label="Username"
                    type="text"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.username}
                    touched={formik.touched.username}
                    disabled
                  />

                  {/* Email */}
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.email}
                    touched={formik.touched.email}
                    disabled
                  />

                  {/* First Name */}
                  <Input
                    label="First Name"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.firstName}
                    touched={formik.touched.firstName}
                  />

                  {/* Last Name */}
                  <Input
                    label="Last Name"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.lastName}
                    touched={formik.touched.lastName}
                  />

                  {/* Phone */}
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.phone}
                    touched={formik.touched.phone}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={loading || (!formik.dirty && !imageFile)}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      formik.resetForm();
                      setImageFile(null);
                      setProfileImage(user?.profileImage ? `http://localhost:5000${user.profileImage}` : null);
                    }}
                    disabled={!formik.dirty && !imageFile}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Change Password Section */}
          <motion.div variants={itemVariants} className="mt-8">
            <Card>
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Security</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Keep your account secure by regularly updating your password
              </p>
              <Button variant="secondary">Change Password</Button>
            </Card>
          </motion.div>

          {/* Account Info */}
          <motion.div variants={itemVariants} className="mt-8">
            <Card>
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-200">{user?._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="text-sm text-gray-900 dark:text-gray-200">{formatDate(user?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-gray-200">{formatDate(user?.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
