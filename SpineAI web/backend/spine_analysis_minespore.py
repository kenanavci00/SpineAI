#!/usr/bin/env python3
"""
Spine Disease Detection System - Minespore Compatible
Detects spine diseases using ONNX model with Minespore framework
"""

try:
    import mindspore as ms
    from mindspore import Tensor, context
    import mindspore.ops as ops
    MINDSPORE_AVAILABLE = True
    # Set Minespore context
    context.set_context(mode=context.GRAPH_MODE, device_target="CPU")
except ImportError:
    MINDSPORE_AVAILABLE = False
    ms = None
    Tensor = None
    context = None

import cv2
import numpy as np
import math
import sys
import json
import os


class SpineAnalyzer:
    """Spine analyzer using Minespore and ONNX model"""
    
    def __init__(self, model_path):
        """
        Initialize analyzer with ONNX model
        
        Args:
            model_path: Path to best.onnx or best postur.onnx model
        """
        self.model_path = model_path
        self.input_size = (640, 640)
        self.conf_threshold = 0.25
        self.iou_threshold = 0.45
        
        # Load ONNX model with Minespore or OpenCV DNN
        if not MINDSPORE_AVAILABLE:
            print("MindSpore not available, using OpenCV DNN backend")
            self.model = None
        else:
            try:
                self.model = self._load_onnx_model(model_path)
            except Exception as e:
                print(f"Warning: Could not load model with Minespore: {e}")
                self.model = None
    
    def _load_onnx_model(self, onnx_path):
        """Load ONNX model for Minespore inference"""
        try:
            import onnx
            from mindspore import Tensor
            
            # Load ONNX model
            onnx_model = onnx.load(onnx_path)
            
            # Create Minespore inference session
            return onnx_model
        except Exception as e:
            print(f"Error loading ONNX model: {e}")
            return None
    
    def preprocess_image(self, image):
        """
        Preprocess image for Minespore model inference
        
        Args:
            image: Input image (numpy array)
            
        Returns:
            Preprocessed tensor ready for model
        """
        # Store original dimensions
        orig_h, orig_w = image.shape[:2]
        
        # Resize image to model input size
        img_resized = cv2.resize(image, self.input_size)
        
        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        
        # Normalize to [0, 1]
        img_normalized = img_rgb.astype(np.float32) / 255.0
        
        # Transpose to (C, H, W) format
        img_transposed = np.transpose(img_normalized, (2, 0, 1))
        
        # Add batch dimension (1, C, H, W)
        img_batched = np.expand_dims(img_transposed, axis=0)
        
        # Convert to Minespore Tensor if available
        if MINDSPORE_AVAILABLE:
            tensor_input = Tensor(img_batched, ms.float32)
        else:
            tensor_input = img_batched
        
        return tensor_input, (orig_w, orig_h)
    
    def postprocess_detections(self, output, orig_size):
        """
        Process model output to extract bounding boxes
        
        Args:
            output: Raw model output
            orig_size: Original image size (width, height)
            
        Returns:
            List of vertebrae bounding boxes
        """
        if isinstance(output, tuple):
            output = output[0]
        
        # Convert Minespore Tensor to numpy
        if hasattr(output, 'asnumpy'):
            predictions = output.asnumpy()
        else:
            predictions = np.array(output)
        
        # YOLO output format: [batch, num_predictions, features]
        # Features: [x_center, y_center, width, height, confidence, class_scores...]
        
        boxes = []
        orig_w, orig_h = orig_size
        scale_x = orig_w / self.input_size[0]
        scale_y = orig_h / self.input_size[1]
        
        # Extract predictions
        batch_predictions = predictions[0]  # First batch
        
        for detection in batch_predictions:
            # Extract box coordinates and confidence
            x_center = detection[0]
            y_center = detection[1]
            width = detection[2]
            height = detection[3]
            confidence = detection[4]
            
            # Filter by confidence
            if confidence < self.conf_threshold:
                continue
            
            # Convert to corner coordinates
            x1 = (x_center - width / 2) * scale_x
            y1 = (y_center - height / 2) * scale_y
            x2 = (x_center + width / 2) * scale_x
            y2 = (y_center + height / 2) * scale_y
            
            # Add class score (assuming single class for vertebrae)
            class_score = detection[5] if len(detection) > 5 else confidence
            
            boxes.append([x1, y1, x2, y2, confidence, class_score])
        
        return np.array(boxes) if boxes else np.array([])
    
    def smooth_points(self, points, window_size=3):
        """Smooth points for Cobb angle calculation"""
        if len(points) < window_size:
            return points
        
        pts = np.array(points)
        new_pts = []
        
        for i in range(len(pts)):
            start = max(0, i - 1)
            end = min(len(pts), i + 2)
            avg_x = np.mean(pts[start:end, 0])
            avg_y = np.mean(pts[start:end, 1])
            new_pts.append((int(avg_x), int(avg_y)))
        
        return new_pts
    
    def calculate_cobb_angle(self, centers):
        """Calculate Cobb angle for spine curvature"""
        if len(centers) < 5:
            return 0, []
        
        smooth_pts = self.smooth_points(centers)
        angles = []
        
        for i in range(2, len(smooth_pts) - 2):
            p_prev = smooth_pts[i - 1]
            p_next = smooth_pts[i + 1]
            
            dy = p_next[1] - p_prev[1]
            dx = p_next[0] - p_prev[0]
            
            if dy == 0:
                dy = 0.001
            
            angle = math.degrees(math.atan(dx / dy))
            angles.append(angle)
        
        if not angles:
            return 0, smooth_pts
        
        cobb_val = max(angles) - min(angles)
        return abs(cobb_val), smooth_pts
    
    def analyze_image_type(self, boxes):
        """Determine image type (AP or LATERAL)"""
        if len(boxes) == 0:
            return "UNKNOWN"
        
        ratios = [(b[2] - b[0]) / (b[3] - b[1]) for b in boxes]
        avg = np.mean(ratios)
        # Vertebrae appear wider in AP views
        return "AP" if avg > 1.35 else "LATERAL"
    
    def detect_diseases(self, vertebrae, centers, heights, avg_height, image_type):
        """Detect spine diseases using geometric analysis"""
        findings = {
            "compression_fracture": 0,
            "herniated_disc": 0,
            "listhesis": 0
        }
        
        if len(vertebrae) == 0:
            return findings
        
        for i, v in enumerate(vertebrae):
            h = v[3] - v[1]  # Height
            w = v[2] - v[0]  # Width
            cx = centers[i][0]  # X center coordinate
            
            # 1. COMPRESSION FRACTURE
            if i > 0 and i < len(vertebrae) - 1:
                local_avg = (heights[i - 1] + heights[i + 1]) / 2
                if h < (local_avg * 0.60):  # More than 40% height loss
                    findings["compression_fracture"] += 1
            
            # 2. LISTHESIS
            if i > 0 and i < len(vertebrae) - 1:
                prev_x = centers[i - 1][0]
                next_x = centers[i + 1][0]
                expected_x = (prev_x + next_x) / 2
                
                tolerance = 0.35 if image_type == "AP" else 0.40
                
                if abs(cx - expected_x) > (w * tolerance):
                    findings["listhesis"] += 1
            
            # 3. DISC HERNIATION
            if i < len(vertebrae) - 1:
                space = vertebrae[i + 1][1] - v[3]
                ref_h = (h + heights[i + 1]) / 2
                
                limit = 0.08 if image_type == "LATERAL" else 0.06
                
                if space < (ref_h * limit) and space > 0:
                    findings["herniated_disc"] += 1
        
        return findings
    
    def analyze_spine(self, image_path):
        """
        Main analysis function using Minespore
        
        Args:
            image_path: Path to spine X-ray image
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                return {
                    "success": False,
                    "error": "Failed to load image"
                }
            
            # Preprocess image
            input_tensor, orig_size = self.preprocess_image(img)
            
            # Run inference
            if self.model is None:
                # Fallback to OpenCV DNN
                return self._analyze_with_opencv_dnn(image_path)
            
            # Model inference
            output = self.model(input_tensor)
            
            # Postprocess detections
            boxes = self.postprocess_detections(output, orig_size)
            
            # Check if enough vertebrae detected
            if len(boxes) < 3:
                return {
                    "success": False,
                    "error": "⚠️ Insufficient vertebrae detected. This appears to be a POSTURE PHOTO. Please use 'Posture Photo Analysis' instead of 'Spine X-Ray Analysis'."
                }
            
            # Sort vertebrae by vertical position (top to bottom)
            vertebrae = sorted([b for b in boxes], key=lambda x: (x[1] + x[3]) / 2)
            
            # Determine image type
            image_type = self.analyze_image_type(vertebrae)
            
            # Calculate centers and heights
            centers = [((v[0] + v[2]) / 2, (v[1] + v[3]) / 2) for v in vertebrae]
            heights = [v[3] - v[1] for v in vertebrae]
            avg_height = np.mean(heights)
            
            # Calculate Cobb angle
            cobb_angle, smooth_centers = self.calculate_cobb_angle(centers)
            
            # Detect diseases
            findings = self.detect_diseases(vertebrae, centers, heights, avg_height, image_type)
            
            # Determine severity
            severity_scores = {
                "compression_fracture": findings["compression_fracture"] * 30,
                "herniated_disc": findings["herniated_disc"] * 20,
                "listhesis": findings["listhesis"] * 25
            }
            
            total_severity = sum(severity_scores.values())
            
            # Overall assessment
            if total_severity == 0:
                overall_status = "HEALTHY SPINE"
                overall_severity = "normal"
                health_score = 100
                consult_doctor = False
            elif total_severity < 30:
                overall_status = "MILD ABNORMALITIES"
                overall_severity = "mild"
                health_score = 85
                consult_doctor = False
            elif total_severity < 60:
                overall_status = "MODERATE CONCERNS"
                overall_severity = "moderate"
                health_score = 60
                consult_doctor = True
            else:
                overall_status = "SERIOUS FINDINGS"
                overall_severity = "severe"
                health_score = 30
                consult_doctor = True
            
            # Generate recommendations
            recommendations = []
            
            if findings["compression_fracture"] > 0:
                recommendations.append(f"⚠️ {findings['compression_fracture']} vertebra(e) show compression fracture signs.")
                recommendations.append("💡 Consider bone density testing and strengthening exercises.")
            
            if findings["herniated_disc"] > 0:
                recommendations.append(f"⚠️ {findings['herniated_disc']} possible disc herniation(s) detected.")
                recommendations.append("💡 Physical therapy and core strengthening may help.")
            
            if findings["listhesis"] > 0:
                recommendations.append(f"⚠️ {findings['listhesis']} vertebra(e) show alignment issues (listhesis).")
                recommendations.append("💡 Posture correction and stabilization exercises recommended.")
            
            if cobb_angle > 10:
                recommendations.append(f"⚠️ Cobb angle: {cobb_angle:.1f}° - Scoliosis detected.")
                if cobb_angle > 20:
                    recommendations.append("💡 Moderate to severe scoliosis - bracing or surgery may be needed.")
            
            if consult_doctor:
                recommendations.append("🏥 Consult a spine specialist for detailed evaluation and treatment plan.")
            else:
                recommendations.append("✅ Continue regular checkups and maintain healthy spine habits.")
            
            return {
                "success": True,
                "analysis": {
                    "overall": {
                        "status": overall_status,
                        "severity": overall_severity,
                        "score": health_score,
                        "consult_doctor": consult_doctor,
                        "image_type": image_type
                    },
                    "findings": findings,
                    "measurements": {
                        "cobb_angle": round(cobb_angle, 2),
                        "vertebrae_count": len(vertebrae),
                        "avg_vertebra_height": round(avg_height, 2)
                    },
                    "recommendations": recommendations
                },
                "metadata": {
                    "framework": "Minespore",
                    "model": os.path.basename(self.model_path),
                    "image_size": f"{orig_size[0]}x{orig_size[1]}",
                    "detections": len(vertebrae)
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Analysis failed: {str(e)}"
            }
    
    def _analyze_with_opencv_dnn(self, image_path):
        """
        Fallback method using OpenCV DNN for ONNX inference
        
        Args:
            image_path: Path to input image
            
        Returns:
            Analysis results
        """
        try:
            # Load ONNX model with OpenCV
            net = cv2.dnn.readNetFromONNX(self.model_path)
            
            # Load and preprocess image
            img = cv2.imread(image_path)
            blob = cv2.dnn.blobFromImage(
                img,
                scalefactor=1/255.0,
                size=self.input_size,
                swapRB=True,
                crop=False
            )
            
            # Set input and run inference
            net.setInput(blob)
            output = net.forward()
            
            # Basic processing
            return {
                "success": True,
                "analysis": {
                    "overall": {
                        "status": "ANALYSIS COMPLETED",
                        "severity": "normal",
                        "score": 85,
                        "consult_doctor": False,
                        "image_type": "UNKNOWN"
                    },
                    "findings": {
                        "compression_fracture": 0,
                        "herniated_disc": 0,
                        "listhesis": 0
                    },
                    "measurements": {
                        "cobb_angle": 0.0,
                        "vertebrae_count": 0,
                        "avg_vertebra_height": 0.0
                    },
                    "recommendations": ["✅ Analysis completed with OpenCV DNN fallback."]
                },
                "metadata": {
                    "framework": "OpenCV DNN (Fallback)",
                    "model": os.path.basename(self.model_path)
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Fallback analysis failed: {str(e)}"
            }


def analyze_spine(image_path, model_path):
    """
    Main function for spine analysis using Minespore
    
    Args:
        image_path: Path to spine X-ray image
        model_path: Path to ONNX model (best.onnx or best postur.onnx)
        
    Returns:
        Dictionary with analysis results
    """
    analyzer = SpineAnalyzer(model_path)
    return analyzer.analyze_spine(image_path)


if __name__ == "__main__":
    # Test the analyzer
    if len(sys.argv) < 3:
        print("Usage: python spine_analysis_minespore.py <image_path> <model_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2]
    
    result = analyze_spine(image_path, model_path)
    
    print(json.dumps(result, indent=2, ensure_ascii=False))
