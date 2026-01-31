import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create a new spine analysis
 * @param {File} imageFile - The spine X-ray image file
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Analysis result
 */
export const createAnalysis = async (imageFile, token) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post(`${API_BASE_URL}/analyses`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Create a new posture analysis
 * @param {File} imageFile - The posture photo
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Analysis result
 */
export const createPostureAnalysis = async (imageFile, token) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post(`${API_BASE_URL}/analyses/posture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Get all analyses for current user
 * @param {string} token - Authentication token
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} List of analyses
 */
export const getUserAnalyses = async (token, page = 1, limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}/analyses`, {
    params: { page, limit },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Get specific analysis by ID
 * @param {string} id - Analysis ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Analysis details
 */
export const getAnalysisById = async (id, token) => {
  const response = await axios.get(`${API_BASE_URL}/analyses/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Delete analysis
 * @param {string} id - Analysis ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteAnalysis = async (id, token) => {
  const response = await axios.delete(`${API_BASE_URL}/analyses/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

/**
 * Get analysis statistics
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Statistics data
 */
export const getAnalysisStats = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/analyses/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};
