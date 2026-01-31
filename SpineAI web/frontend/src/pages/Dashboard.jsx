import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Upload, X, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card, LoadingSkeleton, Badge } from '../components/UI';
import { formatDate } from '../utils/validation';
import { createAnalysis, createPostureAnalysis, getUserAnalyses, getAnalysisStats } from '../services/analysisService';
import { useToast } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Dashboard page component (protected route)
 * - Displays user's analysis history
 * - Shows statistics and trends
 * - Allows image upload for analysis
 * - Real-time analysis with Python backend
 */
const Dashboard = () => {
  const { user, loading: authLoading, token } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisType, setAnalysisType] = useState('spine'); // 'spine' or 'posture'
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const resultRef = useRef(null);

  // Fetch analyses and stats on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken && user) {
      fetchDashboardData();
    } else if (!authLoading && currentToken) {
      // Token exists but user is not loaded yet, wait a bit
      const timer = setTimeout(() => {
        if (localStorage.getItem('accessToken')) {
          fetchDashboardData();
        } else {
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    const currentToken = localStorage.getItem('accessToken');
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch analyses
      try {
        const analysesData = await getUserAnalyses(currentToken, 1, 5);
        setRecentAnalyses(analysesData.data.analyses || []);
      } catch (err) {
        console.log('No analyses yet');
        setRecentAnalyses([]);
      }

      // Fetch stats
      try {
        const statsData = await getAnalysisStats(currentToken);
        setStats(statsData.data || {});
      } catch (err) {
        console.log('No stats yet');
        setStats({});
      }
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setRecentAnalyses([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        showToast('Only JPEG, JPG and PNG formats are supported', 'error');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleStartAnalysis = async () => {
    console.log('🚀 handleStartAnalysis called');
    console.log('📁 Selected file:', selectedFile);
    
    if (!selectedFile) {
      showToast('Please select an image first', 'warning');
      return;
    }

    // Check if user is authenticated
    const currentToken = localStorage.getItem('accessToken');
    console.log('🔑 Token:', currentToken ? 'Var' : 'Yok');
    
    if (!currentToken) {
      showToast('⚠️ Please log in first!', 'error');
      return;
    }

    try {
      setAnalyzing(true);
      showToast('Starting analysis...', 'info');
      
      console.log('📤 Sending request...');
      // Call appropriate analysis function based on type
      const result = analysisType === 'posture' 
        ? await createPostureAnalysis(selectedFile, currentToken)
        : await createAnalysis(selectedFile, currentToken);
      console.log('✅ Analysis result:', result);

      if (result.success) {
        setAnalysisResult(result.data);
        
        if (result.data.consultDoctor) {
          showToast('⚠️ CONSULT A DOCTOR! Pathology detected.', 'warning');
        } else {
          showToast('✅ Analysis completed!', 'success');
        }

        // Refresh dashboard data
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMsg = error.response?.data?.message || 'Error occurred during analysis';
      showToast(errorMsg, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadReport = async () => {
    if (!resultRef.current || !analysisResult) return;

    try {
      setDownloadingPDF(true);
      showToast('Generating PDF report...', 'info');

      // Capture the result section as image
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#1a1a2e',
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text('SpineAI Analysis Report', 105, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      pdf.text(`Patient: ${user?.username || 'N/A'}`, 105, 27, { align: 'center' });
      
      // Add the captured image
      pdf.addImage(imgData, 'PNG', 10, 32, imgWidth, imgHeight);
      
      // Add footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('SpineAI - AI-Powered Spine & Posture Analysis', 105, pageHeight - 10, { align: 'center' });
      
      // Download
      const fileName = `SpineAI_${analysisType}_Report_${Date.now()}.pdf`;
      pdf.save(fileName);
      
      showToast('✅ Report downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Error generating PDF report', 'error');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Welcome back, <span className="text-blue-500">{user?.username}</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300">
            Here's your spinal health dashboard
          </motion.p>
        </motion.div>

        {/* Analysis Upload Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Upload className="w-6 h-6" />
                  New Analysis
                </h2>
                
                <div className="space-y-4">
                  {/* Analysis Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Analysis Type
                    </label>
                    <select
                      value={analysisType}
                      onChange={(e) => setAnalysisType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="spine">🦴 Spine X-Ray Analysis</option>
                      <option value="posture">🧍 Posture Photo Analysis</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {analysisType === 'spine' 
                        ? '📋 X-ray images showing vertebrae (front or side view)' 
                        : '📋 Side profile photo showing full body posture'}
                    </p>
                  </div>
                  
                  {/* File Input */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="spine-image-upload"
                    />
                    <label
                      htmlFor="spine-image-upload"
                      className="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-gray-900 dark:text-gray-200"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        {analysisType === 'posture' 
                          ? 'Select Posture Photo (JPEG, PNG)' 
                          : 'Select X-Ray Image (JPEG, PNG)'}
                      </span>
                    </label>
                  </div>

                  {/* Image Preview and Analysis */}
                  {selectedFile && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Preview */}
                      <div className="relative">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          {analyzing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
                              {/* Scanning line effect */}
                              <div className="absolute inset-0 overflow-hidden">
                                <div 
                                  className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-500/50"
                                  style={{
                                    animation: 'scan 2s linear infinite',
                                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4)'
                                  }}
                                ></div>
                              </div>
                              {/* AI Badge */}
                              <div className="absolute top-4 left-4 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/50 rounded-lg px-4 py-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <span className="text-cyan-300 font-semibold text-sm">🤖 AI Analyzing...</span>
                              </div>
                              {/* Status text */}
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-cyan-300 text-sm font-medium">Artificial Intelligence Processing</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleClearSelection}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          File: {selectedFile.name}
                        </p>
                      </div>

                      {/* Analysis Result or Button */}
                      <div className="flex flex-col justify-center">
                        {!analysisResult ? (
                          <button
                            onClick={handleStartAnalysis}
                            disabled={analyzing}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                          >
                            {analyzing ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="text-lg">Analyzing...</span>
                              </span>
                            ) : (
                              'START ANALYSIS'
                            )}
                          </button>
                        ) : (
                          <div ref={resultRef} className="space-y-4 p-4 bg-gray-900 dark:bg-gray-800 rounded-lg">
                            {/* Consult Doctor Warning */}
                            {analysisResult.consultDoctor && (
                              <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-6 h-6 text-red-600" />
                                  <h3 className="font-bold text-red-600 text-lg">CONSULT A DOCTOR!</h3>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                  {analysisType === 'posture' 
                                    ? 'Posture issues detected. Physical therapy consultation recommended.'
                                    : 'Pathological findings detected. Urgent medical consultation recommended.'}
                                </p>
                              </div>
                            )}

                            {/* Results */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Score:</span>
                                <span className={`text-2xl font-bold ${getSeverityColor(analysisResult.severity || analysisResult.overallSeverity)}`}>
                                  {analysisResult.score}
                                </span>
                              </div>
                              
                              {/* SPINE ANALYSIS RESULTS */}
                              {analysisType === 'spine' && (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Cobb Angle:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{analysisResult.cobbAngle}°</span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Image Type:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{analysisResult.imageType}</span>
                                  </div>

                                  {/* Findings */}
                                  {analysisResult.findings && (
                                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
                                      <h4 className="font-bold mb-2 text-orange-800 dark:text-orange-200">Detected:</h4>
                                      <ul className="space-y-1 text-sm">
                                        {analysisResult.findings.compression_fracture > 0 ? (
                                          <li className="text-red-600 dark:text-red-400 font-medium">• Compression Fracture: {analysisResult.findings.compression_fracture}</li>
                                        ) : null}
                                        {analysisResult.findings.herniated_disc > 0 ? (
                                          <li className="text-orange-600 dark:text-orange-400 font-medium">• Herniated Disc: {analysisResult.findings.herniated_disc}</li>
                                        ) : null}
                                        {analysisResult.findings.listhesis > 0 ? (
                                          <li className="text-yellow-700 dark:text-yellow-400 font-medium">• Vertebral Slip: {analysisResult.findings.listhesis}</li>
                                        ) : null}
                                        {(!analysisResult.findings.compression_fracture && !analysisResult.findings.herniated_disc && !analysisResult.findings.listhesis) && (
                                          <li className="text-gray-700 dark:text-gray-300 font-medium">• No pathological findings detected</li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* POSTURE ANALYSIS RESULTS */}
                              {analysisType === 'posture' && (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Direction:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{analysisResult.direction}</span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700 dark:text-gray-200">Overall Status:</span>
                                    <span className={`font-semibold px-3 py-1 rounded-full ${getSeverityColor(analysisResult.overallSeverity)}`}>
                                      {analysisResult.overallStatus}
                                    </span>
                                  </div>

                                  {/* Head Posture */}
                                  {analysisResult.headPosture && (
                                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                                      <h4 className="font-bold mb-2 text-purple-800 dark:text-purple-200">Head Posture:</h4>
                                      <ul className="space-y-1 text-sm">
                                        <li className="text-gray-700 dark:text-gray-200 font-medium">
                                          Status: <span className={`${analysisResult.headPosture.color === 'red' ? 'text-red-600' : analysisResult.headPosture.color === 'orange' ? 'text-orange-600' : 'text-green-600'}`}>
                                            {analysisResult.headPosture.status}
                                          </span>
                                        </li>
                                        <li className="text-gray-700 dark:text-gray-200 font-medium">
                                          Deviation: {analysisResult.headPosture.deviation_cm} cm
                                        </li>
                                      </ul>
                                    </div>
                                  )}

                                  {/* Back Posture */}
                                  {analysisResult.backPosture && (
                                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg">
                                      <h4 className="font-bold mb-2 text-indigo-800 dark:text-indigo-200">Back Posture:</h4>
                                      <ul className="space-y-1 text-sm">
                                        <li className="text-gray-700 dark:text-gray-200 font-medium">
                                          Status: <span className={`${analysisResult.backPosture.color === 'red' ? 'text-red-600' : analysisResult.backPosture.color === 'orange' ? 'text-orange-600' : 'text-green-600'}`}>
                                            {analysisResult.backPosture.status}
                                          </span>
                                        </li>
                                        <li className="text-gray-700 dark:text-gray-200 font-medium">
                                          Deviation: {analysisResult.backPosture.deviation_cm} cm
                                        </li>
                                      </ul>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Recommendations */}
                              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                                <h4 className="font-bold mb-2 text-blue-800 dark:text-blue-200">Recommendations:</h4>
                                <ul className="space-y-1 text-sm">
                                  {analysisResult.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-gray-700 dark:text-gray-200 font-medium">• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Download Report Button */}
                            <button
                              onClick={handleDownloadReport}
                              disabled={downloadingPDF}
                              className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              {downloadingPDF ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  Generating PDF...
                                </>
                              ) : (
                                <>
                                  <Download className="w-5 h-5" />
                                  Download Report
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Total Analyses */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                    Total Analyses
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.totalAnalyses || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
                  <BarChart3 className="text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Average Score */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                    Average Score
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats?.averageScore || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-2xl">
                  <TrendingUp className="text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Current Status */}
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                    Latest Result
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {recentAnalyses[0]?.result || 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-2xl">
                  <Activity className="text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Analyses */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Recent Analyses
          </motion.h2>

          <motion.div variants={containerVariants} className="space-y-4">
            {recentAnalyses.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No analyses yet. Upload an image above to get started!
                </p>
              </Card>
            ) : (
              recentAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-lg text-gray-900 dark:text-white">
                            {analysis.measurements?.imageType === 'POSTURE' ? '🧍 Posture' : '🦴 Spine'} Analysis #{recentAnalyses.length - index}
                          </p>
                          <Badge
                            variant={
                              analysis.result === 'Excellent'
                                ? 'success'
                                : analysis.result === 'Good'
                                ? 'primary'
                                : analysis.result === 'Poor'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {analysis.result}
                          </Badge>
                          {analysis.consultDoctor && (
                            <Badge variant="danger">
                              Consult Doctor
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {formatDate(new Date(analysis.createdAt))}
                        </p>
                        {analysis.issues && analysis.issues.length > 0 && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Issues: {analysis.issues.join(', ')}
                          </p>
                        )}
                        {analysis.measurements?.imageType !== 'POSTURE' && analysis.measurements?.cobbAngle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Cobb Angle: {analysis.measurements.cobbAngle}°
                          </p>
                        )}
                        {analysis.measurements?.imageType === 'POSTURE' && analysis.measurements?.direction && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Direction: {analysis.measurements.direction}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600 mb-1">
                          {analysis.score}%
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>

        {/* Admin-only section */}
        {user?.role === 'admin' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800"
          >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
              Admin Dashboard
            </motion.h2>
            <motion.div variants={itemVariants}>
              <Card>
                <p className="text-gray-600 dark:text-gray-400">
                  Admin features and user management will be available here
                </p>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
