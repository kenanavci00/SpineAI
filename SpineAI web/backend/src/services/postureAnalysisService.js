import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Posture Analysis Service
 * Analyzes body posture using YOLO pose detection
 */
export class PostureAnalysisService {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, '../../posture_analysis.py');
    this.modelPath = path.join(__dirname, '../../yolov8n-pose.pt');
    this.outputDir = path.join(__dirname, '../../posture_results');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Analyze posture from image
   * @param {string} imagePath - Path to the uploaded image
   * @returns {Promise<Object>} Analysis results
   */
  async analyzePosture(imagePath) {
    return new Promise((resolve, reject) => {
      console.log('🧍 Posture analysis starting...');
      console.log('📁 Image:', imagePath);
      console.log('🤖 Model:', this.modelPath);
      console.log('🐍 Script:', this.pythonScriptPath);

      // Check if files exist
      if (!fs.existsSync(imagePath)) {
        return reject(new Error(`Image file not found: ${imagePath}`));
      }

      if (!fs.existsSync(this.modelPath)) {
        return reject(new Error(`Pose model not found: ${this.modelPath}`));
      }

      if (!fs.existsSync(this.pythonScriptPath)) {
        return reject(new Error(`Python script not found: ${this.pythonScriptPath}`));
      }

      // Spawn Python process with arguments
      const pythonProcess = spawn('python', [
        this.pythonScriptPath,
        imagePath,
        this.modelPath
      ]);

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
        console.log(`🐍 Python Output: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`⚠️ Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Python process failed (exit code: ${code})`);
          return reject(new Error(`Python process failed (code: ${code}): ${errorData}`));
        }

        try {
          const results = this.parseAnalysisOutput(outputData, imagePath);
          console.log('✅ Posture analysis results:', results);
          resolve(results);
        } catch (err) {
          console.error('❌ Result parsing error:', err);
          reject(new Error(`Result parsing error: ${err.message}`));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('❌ Python execution error:', err);
        reject(new Error(`Python execution error: ${err.message}`));
      });
    });
  }

  /**
   * Parse Python script output
   * @param {string} output - Raw output from Python script
   * @param {string} imagePath - Original image path
   * @returns {Object} Parsed analysis results
   */
  parseAnalysisOutput(output, imagePath) {
    try {
      // Find JSON output in the output string
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON output not found');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      return {
        success: true,
        direction: result.direction,
        headPosture: result.headPosture,
        backPosture: result.backPosture,
        overallStatus: result.overallStatus,
        overallSeverity: result.overallSeverity,
        consultDoctor: result.consultDoctor,
        recommendations: result.recommendations,
        score: result.score,
        keypoints: result.keypoints,
        imagePath: imagePath
      };
    } catch (err) {
      throw new Error(`Parsing error: ${err.message}`);
    }
  }
}

export default new PostureAnalysisService();
