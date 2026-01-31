import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Upload, Cpu, PieChart, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Home page component - SpineAI Landing Page
 * Birebir tasarım uygulaması
 */

// Neural Network Background Component
const NeuralNetworkBackground = () => {
  // Generate nodes (neurons) that will move
  const nodes = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    size: Math.random() * 2 + 1.5,
    delay: Math.random() * 2,
    duration: 8 + Math.random() * 8,
    moveDistanceX: 15 + Math.random() * 35,
    moveDistanceY: 15 + Math.random() * 35,
  }));

  // Stars in background
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.2,
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Stars background */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 1.5, star.opacity],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Neural Network SVG */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="node-gradient">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* Moving neurons */}
        {nodes.map((node) => {
          // Calculate random movement path with more variation
          const xPaths = [
            node.initialX,
            node.initialX + (Math.random() - 0.5) * node.moveDistanceX,
            node.initialX + (Math.random() - 0.5) * node.moveDistanceX,
            node.initialX + (Math.random() - 0.5) * node.moveDistanceX,
            node.initialX + (Math.random() - 0.5) * node.moveDistanceX,
            node.initialX,
          ];
          
          const yPaths = [
            node.initialY,
            node.initialY + (Math.random() - 0.5) * node.moveDistanceY,
            node.initialY + (Math.random() - 0.5) * node.moveDistanceY,
            node.initialY + (Math.random() - 0.5) * node.moveDistanceY,
            node.initialY + (Math.random() - 0.5) * node.moveDistanceY,
            node.initialY,
          ];
          
          return (
            <motion.g key={`node-${node.id}`}>
              {/* Outer glow ring */}
              <motion.circle
                cx={`${node.initialX}%`}
                cy={`${node.initialY}%`}
                r={node.size * 2.5}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.5"
                opacity="0.2"
                filter="url(#glow)"
                animate={{
                  cx: xPaths.map(x => `${x}%`),
                  cy: yPaths.map(y => `${y}%`),
                  r: [node.size * 2.5, node.size * 3.5, node.size * 2.5],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: node.duration,
                  repeat: Infinity,
                  delay: node.delay,
                  ease: "easeInOut",
                }}
              />
              {/* Core neuron - moving */}
              <motion.circle
                cx={`${node.initialX}%`}
                cy={`${node.initialY}%`}
                r={node.size}
                fill="url(#node-gradient)"
                filter="url(#glow)"
                animate={{
                  cx: xPaths.map(x => `${x}%`),
                  cy: yPaths.map(y => `${y}%`),
                  r: [node.size, node.size * 1.4, node.size],
                }}
                transition={{
                  duration: node.duration,
                  repeat: Infinity,
                  delay: node.delay,
                  ease: "easeInOut",
                }}
              />
              {/* Inner bright core */}
              <motion.circle
                cx={`${node.initialX}%`}
                cy={`${node.initialY}%`}
                r={node.size * 0.4}
                fill="#ffffff"
                opacity="0.8"
                filter="url(#glow)"
                animate={{
                  cx: xPaths.map(x => `${x}%`),
                  cy: yPaths.map(y => `${y}%`),
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: node.duration,
                  repeat: Infinity,
                  delay: node.delay,
                  ease: "easeInOut",
                }}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Floating gradient orbs */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2, ease: "easeInOut" }}
        className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          x: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 4, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/3 w-80 h-80 bg-indigo-500/15 rounded-full mix-blend-screen filter blur-3xl"
      />
    </div>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel slides
  const slides = [
    {
      title: 'Sensitive Spine Analysis',
      subtitle: 'Powered by AI',
      description: 'Detecting posture disorders with advanced computer vision and delivering clinician-ready insights.',
    },
  ];

  // How It Works steps
  const steps = [
    {
      number: '1',
      title: 'Upload Image',
      subtitle: 'Provide a spine image for analysis',
      description: 'Drag & drop or select an image.',
      icon: Upload,
    },
    {
      number: '2',
      title: 'AI Pose Detection',
      subtitle: 'YOLO8x identifies keypoints',
      description: 'High-precision pose estimation.',
      icon: Cpu,
    },
    {
      number: '3',
      title: 'Spine Angle Analysis',
      subtitle: 'Compute thoracic and lumbar angles',
      description: 'Quantitative angle measurements.',
      icon: PieChart,
    },
    {
      number: '4',
      title: 'Receive Detailed Report',
      subtitle: 'Downloadable clinician-ready report',
      description: 'Visuals and recommendations.',
      icon: FileText,
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0a0e27] text-white overflow-hidden">
      <NeuralNetworkBackground />

      {/* Hero Section with Carousel */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Carousel Navigation */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-5xl mx-auto text-center"
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#93c5fd] bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">
                {slides[currentSlide].subtitle}
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {slides[currentSlide].description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link to={isAuthenticated ? '/dashboard' : '/login'}>
                <button className="px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] rounded-full text-white font-semibold text-lg shadow-lg shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
                  Start Analysis
                </button>
              </Link>
              <Link to="/about">
                <button className="px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white/30 hover:border-white/50 rounded-full text-white font-semibold text-lg transition-all duration-300">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group">
                  {/* Step Number */}
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 mb-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                    <step.icon className="w-full h-full" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {step.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-400 mb-3">
                    {step.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-500">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
