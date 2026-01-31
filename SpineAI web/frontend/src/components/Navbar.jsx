import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';

/**
 * Main navigation component with responsive design
 * - Logo on the left
 * - Navigation links in the center
 * - Auth buttons / Profile dropdown on the right
 * - Mobile hamburger menu with smooth animations
 */
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navItems = [
    { label: 'Analysis', href: '/dashboard' },
    { label: 'About', href: '/about' },
  ];

  // Mobile menu animation variants
  const menuVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Profile dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0e27]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            {/* Advanced Spine Disease Detection Logo */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg 
                width="56" 
                height="56" 
                viewBox="0 0 56 56" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-300 group-hover:scale-105"
              >
                <defs>
                  {/* Modern gradient */}
                  <linearGradient id="spine-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  
                  {/* Glow effect */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Neural network gradient */}
                  <radialGradient id="ai-gradient" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2"/>
                  </radialGradient>
                </defs>
                
                {/* Outer circle - represents medical precision */}
                <circle cx="28" cy="28" r="26" stroke="url(#spine-gradient)" strokeWidth="2" fill="none" opacity="0.3" className="group-hover:opacity-50 transition-opacity"/>
                
                {/* AI Neural Network Background */}
                <g opacity="0.15" className="group-hover:opacity-25 transition-opacity">
                  <line x1="15" y1="10" x2="20" y2="15" stroke="#0ea5e9" strokeWidth="1"/>
                  <line x1="20" y1="15" x2="28" y2="12" stroke="#0ea5e9" strokeWidth="1"/>
                  <line x1="35" y1="15" x2="28" y2="12" stroke="#0ea5e9" strokeWidth="1"/>
                  <line x1="35" y1="15" x2="40" y2="20" stroke="#06b6d4" strokeWidth="1"/>
                  <circle cx="15" cy="10" r="2" fill="#0ea5e9"/>
                  <circle cx="20" cy="15" r="2" fill="#0ea5e9"/>
                  <circle cx="35" cy="15" r="2" fill="#06b6d4"/>
                  <circle cx="40" cy="20" r="2" fill="#06b6d4"/>
                </g>
                
                {/* Main Spine Structure - Curved and anatomical */}
                <path 
                  d="M28 8 C24 12, 22 16, 25 20 C28 24, 32 28, 28 32 C24 36, 22 40, 28 48" 
                  stroke="url(#spine-gradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  fill="none"
                  filter="url(#glow)"
                  className="drop-shadow-lg"
                />
                
                {/* Vertebrae - Modern geometric style */}
                <g className="group-hover:scale-105 transition-transform origin-center">
                  {/* Cervical vertebrae */}
                  <circle cx="28" cy="8" r="3.5" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="28" cy="8" r="2" fill="#e0f2fe"/>
                  
                  <circle cx="25" cy="13" r="3.5" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="25" cy="13" r="2" fill="#e0f2fe"/>
                  
                  {/* Thoracic vertebrae */}
                  <circle cx="24" cy="18" r="4" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="24" cy="18" r="2.2" fill="#e0f2fe"/>
                  
                  <circle cx="26" cy="23" r="4" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="26" cy="23" r="2.2" fill="#e0f2fe"/>
                  
                  <circle cx="30" cy="28" r="4.5" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="30" cy="28" r="2.5" fill="#e0f2fe"/>
                  
                  {/* Lumbar vertebrae - larger */}
                  <circle cx="28" cy="33" r="4.5" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="28" cy="33" r="2.5" fill="#e0f2fe"/>
                  
                  <circle cx="25" cy="38" r="4" fill="url(#spine-gradient)" opacity="0.9"/>
                  <circle cx="25" cy="38" r="2.2" fill="#e0f2fe"/>
                  
                  {/* Sacral */}
                  <ellipse cx="27" cy="43" rx="4" ry="3.5" fill="url(#spine-gradient)" opacity="0.9"/>
                  <ellipse cx="27" cy="43" rx="2.2" ry="2" fill="#e0f2fe"/>
                  
                  <ellipse cx="28" cy="47" rx="3.5" ry="3" fill="url(#spine-gradient)" opacity="0.9"/>
                  <ellipse cx="28" cy="47" rx="2" ry="1.8" fill="#e0f2fe"/>
                </g>
                
                {/* AI Detection Points - Scanning indicators */}
                <g className="opacity-60 group-hover:opacity-100 transition-opacity">
                  <circle cx="24" cy="18" r="6" stroke="#0ea5e9" strokeWidth="1.5" fill="none" opacity="0.4">
                    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  
                  <circle cx="28" cy="33" r="6" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.4">
                    <animate attributeName="r" values="6;8;6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                  </circle>
                </g>
                
                {/* Medical Cross - Bottom right */}
                <g opacity="0.7" className="group-hover:opacity-100 transition-opacity">
                  <rect x="42" y="42" width="2" height="8" rx="1" fill="#0ea5e9"/>
                  <rect x="39" y="45" width="8" height="2" rx="1" fill="#0ea5e9"/>
                </g>
              </svg>
              
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            </div>
            
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-teal-300 transition-all duration-300">
                SpineAI
              </span>
              <span className="text-[10px] text-cyan-400/70 font-medium tracking-wider uppercase">
                Disease Detection
              </span>
            </div>
          </Link>

          {/* Right side - Navigation + Auth */}
          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-white hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  {user?.profileImage ? (
                    <img
                      src={`http://localhost:5000${user.profileImage}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-white">{user?.username}</span>
                </motion.button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-48 bg-[#0a0e27]/95 backdrop-blur-md rounded-lg shadow-lg border border-white/10 overflow-hidden"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-white/10 transition-colors duration-300"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-white/10 transition-colors duration-300"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors duration-300 border-t border-white/10"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-white hover:text-blue-400 font-medium transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-300 text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden pb-4"
          >
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};
