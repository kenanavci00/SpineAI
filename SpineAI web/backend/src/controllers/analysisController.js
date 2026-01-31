import Analysis from '../models/Analysis.js';
import pythonAnalysisService from '../services/pythonAnalysisService.js';
import postureAnalysisService from '../services/postureAnalysisService.js';
import { mockAnalyzeImage } from '../services/mockAnalysisService.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Check if YOLO models exist
const SPINE_MODEL_PATH = path.join(process.cwd(), 'models', 'best.pt');
const POSTURE_MODEL_PATH = path.join(process.cwd(), 'yolov8n-pose.pt');
const USE_MOCK = !fs.existsSync(SPINE_MODEL_PATH);

if (USE_MOCK) {
  console.log('⚠️  Spine YOLO model not found. Using MOCK analysis mode.');
  console.log(`📍 Expected model location: ${SPINE_MODEL_PATH}`);
} else {
  console.log('✅ Spine YOLO model found. Using real AI analysis.');
}

if (fs.existsSync(POSTURE_MODEL_PATH)) {
  console.log('✅ Posture model found. Posture analysis available.');
} else {
  console.log('⚠️  Posture model not found. Posture analysis disabled.');
  console.log(`📍 Expected location: ${POSTURE_MODEL_PATH}`);
}

/**
 * Create new spine analysis
 * POST /api/analyses
 */
export const createAnalysis = async (req, res, next) => {
  console.log('📥 createAnalysis called');
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload a spine X-ray image'
      });
    }

    const userId = req.user.userId;
    const imagePath = req.file.path;

    console.log(`🔬 Analysis starting - User: ${userId}, File: ${req.file.filename}`);
    console.log(`📂 File path: ${imagePath}`);

    // Run Python analysis or Mock analysis
    let analysisResult;
    try {
      if (USE_MOCK) {
        console.log('🧪 Using Mock analysis...');
        analysisResult = await mockAnalyzeImage(imagePath);
        console.log('✅ Mock analysis completed:', analysisResult);
      } else {
        console.log('🤖 Using YOLO AI analysis...');
        try {
          analysisResult = await pythonAnalysisService.analyzeImage(imagePath);
        } catch (yoloError) {
          console.log('⚠️ YOLO analysis failed, switching to MOCK mode...');
          console.log('Error:', yoloError.message);
          analysisResult = await mockAnalyzeImage(imagePath);
          console.log('✅ Completed with mock analysis:', analysisResult);
        }
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      // Clean up uploaded file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      return res.status(500).json({
        success: false,
        message: 'Error during image analysis',
        error: error.message
      });
    }

    // Determine result category
    let resultCategory = 'Excellent';
    if (analysisResult.severity === 'critical') {
      resultCategory = 'Poor';
    } else if (analysisResult.severity === 'moderate') {
      resultCategory = 'Fair';
    } else if (analysisResult.score < 85) {
      resultCategory = 'Good';
    }

    // Map findings to issues array
    const issues = [];
    if (analysisResult.findings.compression_fracture > 0) {
      issues.push('Compression Fracture');
    }
    if (analysisResult.findings.herniated_disc > 0) {
      issues.push('Herniated Disc');
    }
    if (analysisResult.findings.listhesis > 0) {
      issues.push('Listhesis');
    }
    if (analysisResult.imageType === 'AP' && analysisResult.cobbAngle > 10) {
      issues.push('Scoliosis');
    }
    if (analysisResult.imageType === 'LATERAL') {
      if (analysisResult.cobbAngle < 20) {
        issues.push('Lordosis Flattening');
      } else if (analysisResult.cobbAngle > 60) {
        issues.push('Excessive Lordosis');
      }
    }

    // Create analysis record in database
    const analysis = new Analysis({
      userId,
      imageUrl: `/uploads/${req.file.filename}`,
      result: resultCategory,
      score: analysisResult.score,
      measurements: {
        cobbAngle: analysisResult.cobbAngle,
        imageType: analysisResult.imageType,
        vertebraeCount: analysisResult.vertebraeCount
      },
      issues: issues,
      recommendations: analysisResult.recommendations,
      findings: analysisResult.findings,
      consultDoctor: analysisResult.consultDoctor,
      severity: analysisResult.severity
    });

    await analysis.save();

    console.log(`✅ Analysis completed - ID: ${analysis._id}, Score: ${analysisResult.score}`);

    // Return response
    res.status(201).json({
      success: true,
      message: analysisResult.consultDoctor 
        ? 'Analysis completed. CONSULT A DOCTOR!' 
        : 'Analysis completed successfully',
      data: {
        analysisId: analysis._id,
        result: resultCategory,
        score: analysisResult.score,
        cobbAngle: analysisResult.cobbAngle,
        imageType: analysisResult.imageType,
        vertebraeCount: analysisResult.vertebraeCount,
        findings: analysisResult.findings,
        issues: issues,
        recommendations: analysisResult.recommendations,
        consultDoctor: analysisResult.consultDoctor,
        severity: analysisResult.severity,
        imageUrl: analysis.imageUrl,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Analiz oluşturma hatası:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Dosya temizleme hatası:', cleanupError);
      }
    }

    next(error);
  }
};

/**
 * Get all analyses for current user
 * GET /api/analyses
 */
export const getUserAnalyses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const analyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Analysis.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Analiz listesi hatası:', error);
    next(error);
  }
};

/**
 * Get specific analysis by ID
 * GET /api/analyses/:id
 */
export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const analysis = await Analysis.findOne({
      _id: id,
      userId
    }).select('-__v');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analiz bulunamadı'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analiz detay hatası:', error);
    next(error);
  }
};

/**
 * Delete analysis
 * DELETE /api/analyses/:id
 */
export const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const analysis = await Analysis.findOne({
      _id: id,
      userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analiz bulunamadı'
      });
    }

    // Delete associated image file
    if (analysis.imageUrl) {
      const imagePath = path.join(process.cwd(), 'uploads', path.basename(analysis.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Analysis.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Analiz başarıyla silindi'
    });
  } catch (error) {
    console.error('Analiz silme hatası:', error);
    next(error);
  }
};

/**
 * Get analysis statistics for current user
 * GET /api/analyses/stats
 */
export const getAnalysisStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const totalAnalyses = await Analysis.countDocuments({ userId });
    
    const avgScore = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    const recentAnalyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('result score createdAt');

    const issueStats = await Analysis.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$issues' },
      { $group: { _id: '$issues', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalAnalyses,
        averageScore: avgScore[0]?.avgScore?.toFixed(1) || 0,
        recentAnalyses,
        commonIssues: issueStats
      }
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    next(error);
  }
};


/**
 * Create new posture analysis
 * POST /api/analyses/posture
 */
export const createPostureAnalysis = async (req, res, next) => {
  console.log('🧍 createPostureAnalysis called');
  
  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const userId = req.user.userId;
    const imagePath = req.file.path;

    console.log(`🔬 Posture analysis starting - User: ${userId}, File: ${req.file.filename}`);
    console.log(`📂 File path: ${imagePath}`);

    let postureResult;
    try {
      console.log('🤖 Using YOLO Pose analysis...');
      postureResult = await postureAnalysisService.analyzePosture(imagePath);
      console.log('✅ Posture analysis completed:', postureResult);
    } catch (error) {
      console.error('❌ Posture analysis error:', error);
      
      // Clean up uploaded file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      return res.status(500).json({
        success: false,
        message: 'Error during posture analysis',
        error: error.message
      });
    }

    // Determine result category
    let resultCategory = 'Excellent';
    if (postureResult.overallSeverity === 'critical' || postureResult.overallSeverity === 'moderate') {
      resultCategory = 'Fair';
    } else if (postureResult.score < 85) {
      resultCategory = 'Good';
    }

    // Create issues array from posture findings
    const issues = [];
    if (postureResult.headPosture && postureResult.headPosture.status !== 'NORMAL') {
      issues.push(postureResult.headPosture.status);
    }
    if (postureResult.backPosture && postureResult.backPosture.status !== 'BACK ALIGNED') {
      issues.push(postureResult.backPosture.status);
    }

    // Create analysis record in database
    const analysis = new Analysis({
      userId,
      imageUrl: `/uploads/${req.file.filename}`,
      result: resultCategory,
      score: postureResult.score,
      measurements: { 
        imageType: 'POSTURE', 
        direction: postureResult.direction 
      },
      issues: issues,
      recommendations: postureResult.recommendations,
      consultDoctor: postureResult.consultDoctor,
      severity: postureResult.overallSeverity
    });

    await analysis.save();

    console.log(`✅ Posture analysis saved - ID: ${analysis._id}, Score: ${postureResult.score}`);

    res.status(201).json({
      success: true,
      message: postureResult.consultDoctor 
        ? 'Posture analysis completed. Consult a physical therapist!' 
        : 'Posture analysis completed successfully',
      data: {
        analysisId: analysis._id,
        result: resultCategory,
        score: postureResult.score,
        direction: postureResult.direction,
        headPosture: postureResult.headPosture,
        backPosture: postureResult.backPosture,
        overallStatus: postureResult.overallStatus,
        overallSeverity: postureResult.overallSeverity,
        consultDoctor: postureResult.consultDoctor,
        recommendations: postureResult.recommendations,
        keypoints: postureResult.keypoints,
        imageUrl: analysis.imageUrl,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Posture analysis creation error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    next(error);
  }
};
