# Minespore Integration Guide

## Overview

This project now includes **Minespore-compatible** implementations for posture and spine analysis using ONNX models. The new implementations maintain all existing functionality while leveraging Minespore's AI framework capabilities.

## New Files

### 1. `posture_analysis_minespore.py`
- **Purpose**: Posture analysis using Minespore framework
- **Model**: `best postur.onnx`
- **Features**:
  - Forward/backward head posture detection
  - Kyphosis (slouching) detection
  - Body keypoint detection with 17 COCO keypoints
  - Angle calculations for neck and torso
  - Detailed recommendations

### 2. `spine_analysis_minespore.py`
- **Purpose**: Spine disease detection using Minespore framework
- **Model**: `best.onnx` or `best postur.onnx`
- **Features**:
  - Compression fracture detection
  - Disc herniation detection
  - Listhesis (vertebral misalignment) detection
  - Cobb angle calculation for scoliosis
  - X-ray type classification (AP/LATERAL)

## Installation

### Step 1: Install Minespore

```bash
# For CPU version
pip install mindspore

# For GPU version (CUDA 11.6)
pip install mindspore-gpu

# For specific version
pip install mindspore==2.2.0
```

### Step 2: Install Dependencies

```bash
cd backend
pip install -r requirements_minespore.txt
```

## Usage

### Posture Analysis

```python
from posture_analysis_minespore import analyze_posture

# Analyze a posture photo
result = analyze_posture(
    image_path="path/to/posture_photo.jpg",
    model_path="path/to/best postur.onnx"
)

print(result)
```

**Command Line:**
```bash
python posture_analysis_minespore.py image.jpg "best postur.onnx"
```

### Spine Analysis

```python
from spine_analysis_minespore import analyze_spine

# Analyze a spine X-ray
result = analyze_spine(
    image_path="path/to/xray.jpg",
    model_path="path/to/best.onnx"
)

print(result)
```

**Command Line:**
```bash
python spine_analysis_minespore.py xray.jpg best.onnx
```

## Model Format

Both analyzers use **ONNX (Open Neural Network Exchange)** models:

- **best postur.onnx**: Trained for human pose estimation (17 keypoints)
- **best.onnx**: Trained for vertebrae detection in spine X-rays

### ONNX Model Structure

The models follow YOLO detection format with:
- **Input**: `[1, 3, 640, 640]` (Batch, Channels, Height, Width)
- **Output**: Detection results with bounding boxes and/or keypoints

## Key Features

### 1. Minespore Integration
- Uses Minespore's `Tensor` and computational graph
- Context configuration for CPU/GPU execution
- ONNX model loading and inference

### 2. Preprocessing Pipeline
```python
# Image → Resize → RGB → Normalize → Transpose → Tensor
input_tensor, orig_size = analyzer.preprocess_image(image)
```

- Resize to 640×640
- BGR to RGB conversion
- Normalization to [0, 1]
- Channel-first format (C, H, W)
- Minespore Tensor conversion

### 3. Postprocessing
- Confidence-based filtering
- Coordinate scaling to original dimensions
- NMS (Non-Maximum Suppression) for overlapping detections
- Keypoint extraction and validation

### 4. Fallback Support
Both implementations include **OpenCV DNN fallback**:
- Automatically used if Minespore fails
- Ensures compatibility across different systems
- Same preprocessing and output format

## Output Format

### Posture Analysis Output
```json
{
  "success": true,
  "analysis": {
    "overall": {
      "status": "HEALTHY POSTURE",
      "severity": "normal",
      "score": 100,
      "consult_doctor": false,
      "direction": "RIGHT"
    },
    "head": {
      "status": "NORMAL",
      "severity": "normal",
      "color": "green",
      "deviation_cm": 0.0
    },
    "back": {
      "status": "BACK ALIGNED",
      "severity": "normal",
      "color": "green",
      "deviation_cm": 0.0
    },
    "angles": {
      "neck_angle": 5.2,
      "torso_angle": 2.1
    },
    "recommendations": [...]
  },
  "metadata": {
    "framework": "Minespore",
    "model": "best postur.onnx",
    "image_size": "1920x1080",
    "keypoints_detected": 17
  }
}
```

### Spine Analysis Output
```json
{
  "success": true,
  "analysis": {
    "overall": {
      "status": "HEALTHY SPINE",
      "severity": "normal",
      "score": 100,
      "consult_doctor": false,
      "image_type": "LATERAL"
    },
    "findings": {
      "compression_fracture": 0,
      "herniated_disc": 0,
      "listhesis": 0
    },
    "measurements": {
      "cobb_angle": 5.2,
      "vertebrae_count": 12,
      "avg_vertebra_height": 45.3
    },
    "recommendations": [...]
  },
  "metadata": {
    "framework": "Minespore",
    "model": "best.onnx",
    "image_size": "800x1200",
    "detections": 12
  }
}
```

## Architecture

### Class Structure

#### PostureAnalyzer
```python
class PostureAnalyzer:
    def __init__(self, model_path)
    def preprocess_image(self, image)
    def postprocess_output(self, output, orig_shape)
    def calculate_angles(self, keypoints)
    def analyze_posture(self, image_path)
```

#### SpineAnalyzer
```python
class SpineAnalyzer:
    def __init__(self, model_path)
    def preprocess_image(self, image)
    def postprocess_detections(self, output, orig_size)
    def calculate_cobb_angle(self, centers)
    def detect_diseases(self, vertebrae, centers, heights, ...)
    def analyze_spine(self, image_path)
```

## Minespore Context Configuration

```python
import mindspore as ms
from mindspore import context

# Set execution mode
context.set_context(mode=context.GRAPH_MODE, device_target="CPU")

# For GPU
context.set_context(mode=context.GRAPH_MODE, device_target="GPU")

# For dynamic shape
context.set_context(mode=context.PYNATIVE_MODE, device_target="CPU")
```

## Comparison: Original vs Minespore

| Feature | Original (Ultralytics) | Minespore Version |
|---------|----------------------|-------------------|
| Framework | PyTorch + Ultralytics | Minespore + ONNX |
| Model Format | `.pt` (PyTorch) | `.onnx` (ONNX) |
| Inference | YOLO API | Custom preprocessing + inference |
| Preprocessing | Automatic | Manual control |
| Device Support | CUDA, CPU, MPS | CPU, GPU, Ascend |
| Fallback | None | OpenCV DNN |

## Troubleshooting

### Issue: Minespore not installing
**Solution**: Try specific version or use conda
```bash
conda install mindspore-cpu -c mindspore -c conda-forge
```

### Issue: ONNX model not loading
**Solution**: Verify ONNX model integrity
```python
import onnx
model = onnx.load("best postur.onnx")
onnx.checker.check_model(model)
```

### Issue: Low detection accuracy
**Solution**: Adjust confidence threshold
```python
analyzer.conf_threshold = 0.3  # Lower for more detections
```

### Issue: Out of memory
**Solution**: Reduce input size or use CPU mode
```python
analyzer.input_size = (416, 416)  # Smaller input
context.set_context(device_target="CPU")
```

## Performance Tips

1. **Use GPU**: Set `device_target="GPU"` for faster inference
2. **Batch Processing**: Process multiple images together
3. **Model Optimization**: Use ONNX optimization tools
4. **Cache Model**: Load model once, reuse for multiple images

## Integration with Existing System

The Minespore implementations can be integrated into the existing system:

### Option 1: Replace Original Files
```python
# In pythonAnalysisService.js
const pythonScript = 'posture_analysis_minespore.py';
```

### Option 2: Add as Alternative
```python
# Add configuration option
const framework = process.env.AI_FRAMEWORK || 'ultralytics';
const script = framework === 'minespore' 
  ? 'posture_analysis_minespore.py' 
  : 'posture_analysis.py';
```

### Option 3: Feature Flag
```javascript
// In backend config
module.exports = {
  useMinespore: process.env.USE_MINESPORE === 'true',
  minesporeModel: 'best postur.onnx',
  ultralyticsModel: 'yolov8n-pose.pt'
};
```

## Model Conversion (Optional)

If you have PyTorch models and want to convert to ONNX:

```python
from ultralytics import YOLO

# Load PyTorch model
model = YOLO('yolov8n-pose.pt')

# Export to ONNX
model.export(format='onnx', dynamic=False, simplify=True)
```

## Future Enhancements

1. **Quantization**: Reduce model size and increase speed
2. **Multi-backend**: Support for TensorRT, OpenVINO
3. **Streaming**: Real-time video analysis
4. **Distributed**: Multi-device inference
5. **Model Ensemble**: Combine multiple models

## References

- [Minespore Official Documentation](https://www.mindspore.cn/en)
- [ONNX Format Specification](https://onnx.ai/)
- [YOLOv8 Architecture](https://docs.ultralytics.com/)

## Support

For issues or questions about Minespore integration:
1. Check this documentation
2. Review error messages carefully
3. Test with fallback mode (OpenCV DNN)
4. Verify model file integrity

## License

Same as the main project license.
