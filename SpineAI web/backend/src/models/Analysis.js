import mongoose from 'mongoose';

/**
 * Analysis Schema for storing spine analysis results
 * - Stores analysis data for each user
 * - Includes posture measurements and recommendations
 * - Tracks analysis history over time
 */
const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    measurements: {
      cobbAngle: Number,
      imageType: String,
      vertebraeCount: Number,
      thoracicAngle: Number,
      lumbarAngle: Number,
      neckPosture: String,
      shoulderAlignment: String,
    },
    issues: [
      {
        type: String,
        enum: [
          'Kyphosis', 
          'Lordosis', 
          'Scoliosis', 
          'Forward Head Posture',
          'Compression Fracture',
          'Herniated Disc',
          'Listhesis',
          'Lordosis Flattening',
          'Excessive Lordosis',
          'FORWARD HEAD POSTURE',
          'BACKWARD HEAD POSTURE',
          'KYPHOSIS (SLOUCHING)',
          'NORMAL',
          'BACK ALIGNED'
        ],
      },
    ],
    findings: {
      compression_fracture: { type: Number, default: 0 },
      herniated_disc: { type: Number, default: 0 },
      listhesis: { type: Number, default: 0 }
    },
    consultDoctor: {
      type: Boolean,
      default: false
    },
    severity: {
      type: String,
      enum: ['normal', 'moderate', 'critical'],
      default: 'normal'
    },
    recommendations: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
analysisSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Analysis', analysisSchema);
