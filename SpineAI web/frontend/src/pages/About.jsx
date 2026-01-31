import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI';

/**
 * About page component
 * - Explains the SpineAI project
 * - Lists key features
 * - Shows team/technology info
 */
const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      title: 'AI-Powered Detection',
      description: 'Advanced computer vision algorithms for accurate posture analysis',
    },
    {
      title: 'Secure & Private',
      description: 'Enterprise-grade encryption and secure data storage',
    },
    {
      title: 'Real-Time Analysis',
      description: 'Instant feedback and clinician-ready reports',
    },
    {
      title: 'Responsive Design',
      description: 'Works seamlessly on desktop, tablet, and mobile devices',
    },
    {
      title: 'User-Friendly Interface',
      description: 'Intuitive and modern UI with smooth animations',
    },
    {
      title: 'Detailed Reports',
      description: 'Comprehensive analysis with actionable recommendations',
    },
  ];

  const technologies = [
    { category: 'Frontend', items: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'MongoDB', 'JWT Auth'] },
    { category: 'Tools', items: ['Formik', 'Yup', 'Axios', 'React Router'] },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            About <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SpineAI</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-400">
            Revolutionizing spinal health analysis with artificial intelligence
          </motion.p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                SpineAI aims to make advanced spine posture analysis accessible to everyone. Using cutting-edge artificial intelligence and computer vision technology, we help individuals and healthcare professionals detect posture disorders early, enabling timely intervention and better spinal health outcomes.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Our platform combines scientific accuracy with user-friendly design, delivering clinician-ready insights that empower users to take control of their spinal health.
              </p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">
            Key Features
          </motion.h2>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">
            Technology Stack
          </motion.h2>
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{tech.category}</h3>
                  <ul className="space-y-2">
                    {tech.items.map((item, i) => (
                      <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Accuracy Rate', value: '99.8%' },
              { label: 'Users', value: '50K+' },
              { label: 'Analyses', value: '500K+' },
              { label: 'Countries', value: '45+' },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Transform Your Spinal Health?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Join thousands of users who are already benefiting from SpineAI
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
