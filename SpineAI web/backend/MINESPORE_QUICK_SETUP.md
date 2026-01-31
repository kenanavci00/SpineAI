# Quick Setup Guide for Minespore Integration

## What's New?

Three new files have been created to enable Minespore-based analysis:

1. **posture_analysis_minespore.py** - Posture analysis with Minespore
2. **spine_analysis_minespore.py** - Spine analysis with Minespore  
3. **test_minespore.py** - Test suite for validation

## Installation Steps

### Step 1: Install Minespore

```powershell
# Choose ONE of the following based on your system:

# Option A: CPU version (recommended for most users)
pip install mindspore

# Option B: GPU version (if you have NVIDIA GPU)
pip install mindspore-gpu

# Option C: Using conda (alternative)
conda install mindspore -c mindspore -c conda-forge
```

### Step 2: Install Additional Dependencies

```powershell
cd backend
pip install -r requirements_minespore.txt
```

### Step 3: Verify Installation

```powershell
python test_minespore.py
```

Expected output:
```
✅ All tests passed! Minespore integration is working correctly.
```

## Using the Models

### Required Model Files

Place these ONNX models in the `backend` directory:

- **best postur.onnx** - For posture analysis (attached file)
- **best.onnx** - For spine analysis (attached file)

You can copy them from the `c:\Users\nisa\Desktop\yeni\` folder:

```powershell
# Copy models to backend folder
Copy-Item "C:\Users\nisa\Desktop\yeni\best postur.onnx" ".\backend\"
Copy-Item "C:\Users\nisa\Desktop\yeni\best.onnx" ".\backend\"
```

## Quick Test

### Test Posture Analysis

```powershell
cd backend
python posture_analysis_minespore.py "path\to\image.jpg" "best postur.onnx"
```

### Test Spine Analysis

```powershell
cd backend
python spine_analysis_minespore.py "path\to\xray.jpg" "best.onnx"
```

## Integration Options

### Option 1: Update Existing Service (Recommended)

Modify `backend/src/services/pythonAnalysisService.js`:

```javascript
// Add configuration at the top
const USE_MINESPORE = process.env.USE_MINESPORE === 'true';

// Update script selection
const getAnalysisScript = (type) => {
  if (USE_MINESPORE) {
    return type === 'posture' 
      ? 'posture_analysis_minespore.py'
      : 'spine_analysis_minespore.py';
  } else {
    return type === 'posture'
      ? 'posture_analysis.py'
      : 'spine_analysis.py';
  }
};

// Update model selection
const getModelPath = (type) => {
  if (USE_MINESPORE) {
    return type === 'posture'
      ? path.join(__dirname, '../../best postur.onnx')
      : path.join(__dirname, '../../best.onnx');
  } else {
    return type === 'posture'
      ? path.join(__dirname, '../../yolov8n-pose.pt')
      : path.join(__dirname, '../../models/best.pt');
  }
};
```

Then enable Minespore in your `.env` file:

```env
USE_MINESPORE=true
```

### Option 2: Create New Service

Create `backend/src/services/minesporeAnalysisService.js`:

```javascript
const { spawn } = require('child_process');
const path = require('path');

const analyzeWithMinespore = async (imagePath, type) => {
  return new Promise((resolve, reject) => {
    const scriptMap = {
      posture: 'posture_analysis_minespore.py',
      spine: 'spine_analysis_minespore.py'
    };
    
    const modelMap = {
      posture: 'best postur.onnx',
      spine: 'best.onnx'
    };
    
    const scriptPath = path.join(__dirname, '../../', scriptMap[type]);
    const modelPath = path.join(__dirname, '../../', modelMap[type]);
    
    const pythonProcess = spawn('python', [scriptPath, imagePath, modelPath]);
    
    let outputData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Analysis failed: ${errorData}`));
      } else {
        try {
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse result: ${error.message}`));
        }
      }
    });
  });
};

module.exports = { analyzeWithMinespore };
```

### Option 3: Add Route Parameter

Allow users to choose framework via API:

```javascript
// In backend/src/routes/analysisRoutes.js
router.post('/analyze', upload.single('image'), async (req, res) => {
  const { type, framework = 'ultralytics' } = req.body;
  
  if (framework === 'minespore') {
    // Use Minespore analysis
    const result = await minesporeAnalysisService.analyze(req.file.path, type);
    return res.json(result);
  } else {
    // Use original analysis
    const result = await pythonAnalysisService.analyze(req.file.path, type);
    return res.json(result);
  }
});
```

## Environment Variables

Add to your `.env` file:

```env
# Minespore Configuration
USE_MINESPORE=true
MINESPORE_DEVICE=CPU
MINESPORE_POSTURE_MODEL=best postur.onnx
MINESPORE_SPINE_MODEL=best.onnx

# Confidence thresholds
POSTURE_CONFIDENCE=0.5
SPINE_CONFIDENCE=0.25
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'mindspore'"

**Solution:**
```powershell
pip install mindspore
```

### Issue: "ONNX model not found"

**Solution:**
```powershell
# Verify model exists
Test-Path ".\backend\best postur.onnx"

# If false, copy the model
Copy-Item "C:\Users\nisa\Desktop\yeni\best postur.onnx" ".\backend\"
```

### Issue: "No person detected in the image"

**Solution:**
- Ensure image contains a visible person
- Try lowering confidence threshold
- Check image quality and lighting

### Issue: Performance is slow

**Solution:**
```python
# In the analyzer files, reduce input size
self.input_size = (416, 416)  # Instead of (640, 640)
```

## Performance Comparison

| Framework | Model Format | Speed (CPU) | Accuracy |
|-----------|-------------|-------------|----------|
| Ultralytics | .pt (PyTorch) | Fast | High |
| Minespore | .onnx | Medium | High |
| OpenCV DNN | .onnx | Very Fast | Medium |

## Next Steps

1. ✅ Install Minespore and dependencies
2. ✅ Copy ONNX models to backend folder
3. ✅ Run test suite (`python test_minespore.py`)
4. ✅ Choose integration option (1, 2, or 3)
5. ✅ Update configuration files
6. ✅ Test with real images
7. ✅ Deploy to production

## Support

For detailed information, see:
- [MINESPORE_INTEGRATION.md](MINESPORE_INTEGRATION.md) - Full documentation
- [requirements_minespore.txt](requirements_minespore.txt) - Dependencies
- [test_minespore.py](test_minespore.py) - Test suite

## Benefits of Minespore Integration

✅ **Framework flexibility** - Choose between PyTorch and Minespore
✅ **ONNX compatibility** - Use standardized model format
✅ **Better control** - Manual preprocessing and postprocessing
✅ **Fallback support** - OpenCV DNN as backup
✅ **Production ready** - Optimized for deployment
