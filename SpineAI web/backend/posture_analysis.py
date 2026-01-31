#!/usr/bin/env python3
"""
Posture Analysis System
Analyzes body posture using YOLO pose detection
"""

from ultralytics import YOLO
import cv2
import numpy as np
import sys
import json
import os


def analyze_posture(image_path, model_path):
    """
    Analyze posture from image
    
    Args:
        image_path: Path to the input image
        model_path: Path to YOLO pose model (yolov8n-pose.pt)
    
    Returns:
        Dictionary with analysis results
    """
    try:
        # 1. Load Model
        model = YOLO(model_path)
        
        # 2. Run Prediction
        results = model.predict(source=image_path, save=False, conf=0.5, verbose=False)
        
        if not results or len(results[0].keypoints) == 0:
            return {
                "success": False,
                "error": "No person detected in the image"
            }
        
        # Get first person's keypoints
        kpts = results[0].keypoints.xy.cpu().numpy()[0]
        
        if kpts.shape[0] == 0:
            return {
                "success": False,
                "error": "Insufficient keypoints detected"
            }
        
        # Load image for measurements
        img = cv2.imread(image_path)
        h_img, w_img, _ = img.shape
        
        # --- KEYPOINT COORDINATES (Average of Left and Right) ---
        # Nose (0), Ears (3,4), Shoulders (5,6), Hips (11,12)
        
        nose_x = kpts[0][0]
        
        ear_x = (kpts[3][0] + kpts[4][0]) / 2
        ear_y = (kpts[3][1] + kpts[4][1]) / 2
        
        shoulder_x = (kpts[5][0] + kpts[6][0]) / 2
        shoulder_y = (kpts[5][1] + kpts[6][1]) / 2
        
        hip_x = (kpts[11][0] + kpts[12][0]) / 2
        hip_y = (kpts[11][1] + kpts[12][1]) / 2
        
        # --- STEP 1: DIRECTION DETECTION ---
        # Determine if person is facing right or left
        if nose_x > shoulder_x:
            direction = "RIGHT"
            direction_coef = 1
        else:
            direction = "LEFT"
            direction_coef = -1
        
        # --- STEP 2: REFERENCE LENGTH (TORSO HEIGHT) ---
        # Use torso height as reference for zoom invariance
        torso_height = abs(hip_y - shoulder_y)
        if torso_height == 0:
            torso_height = 1  # Prevent division by zero
        
        # --- ANALYSIS 1: FORWARD HEAD POSTURE ---
        # How far forward is the ear compared to the shoulder?
        head_deviation = (ear_x - shoulder_x) * direction_coef
        
        # Threshold: 15% of torso height
        head_status = "NORMAL"
        head_severity = "normal"
        head_color = "green"
        
        if head_deviation > (torso_height * 0.15):
            head_status = "FORWARD HEAD POSTURE"
            head_severity = "moderate"
            head_color = "red"
        elif head_deviation < -(torso_height * 0.10):
            head_status = "BACKWARD HEAD POSTURE"
            head_severity = "mild"
            head_color = "orange"
        
        # Calculate estimated deviation in cm (assuming avg torso is 50cm)
        head_deviation_cm = float((head_deviation / torso_height) * 50)
        
        # --- ANALYSIS 2: KYPHOSIS / SLOUCHING ---
        # How far forward is the shoulder compared to the hip?
        shoulder_deviation = (shoulder_x - hip_x) * direction_coef
        
        # Threshold: 12% of torso height
        back_status = "BACK ALIGNED"
        back_severity = "normal"
        back_color = "green"
        
        if shoulder_deviation > (torso_height * 0.12):
            back_status = "KYPHOSIS (SLOUCHING)"
            back_severity = "moderate"
            back_color = "red"
        
        # Calculate estimated deviation in cm
        shoulder_deviation_cm = float((shoulder_deviation / torso_height) * 50)
        
        # --- OVERALL ASSESSMENT ---
        consult_doctor = False
        overall_status = "HEALTHY POSTURE"
        overall_severity = "normal"
        recommendations = []
        
        if "POSTURE" in head_status or "KYPHOSIS" in back_status:
            consult_doctor = True
            overall_status = "POSTURE ISSUES DETECTED"
            overall_severity = "moderate"
            
            if "FORWARD HEAD POSTURE" in head_status:
                recommendations.append("⚠️ Forward head posture detected. Consider neck strengthening exercises.")
                recommendations.append("💡 Adjust screen height to eye level.")
            
            if "KYPHOSIS" in back_status:
                recommendations.append("⚠️ Slouching detected. Focus on back strengthening and stretching.")
                recommendations.append("💡 Practice proper sitting posture with back support.")
            
            recommendations.append("🏥 Consult a physical therapist for personalized treatment.")
        else:
            recommendations.append("✅ Healthy posture detected. Keep maintaining good posture habits!")
        
        # Calculate posture score (0-100)
        score = 100
        
        if head_status != "NORMAL":
            score -= 25
        
        if back_status != "BACK ALIGNED":
            score -= 30
        
        score = max(0, score)
        
        # --- RETURN RESULTS ---
        return {
            "success": True,
            "direction": direction,
            "headPosture": {
                "status": head_status,
                "severity": head_severity,
                "deviation_cm": round(head_deviation_cm, 1),
                "color": head_color
            },
            "backPosture": {
                "status": back_status,
                "severity": back_severity,
                "deviation_cm": round(shoulder_deviation_cm, 1),
                "color": back_color
            },
            "overallStatus": overall_status,
            "overallSeverity": overall_severity,
            "consultDoctor": consult_doctor,
            "recommendations": recommendations,
            "score": int(score),
            "keypoints": {
                "ear": {"x": float(ear_x), "y": float(ear_y)},
                "shoulder": {"x": float(shoulder_x), "y": float(shoulder_y)},
                "hip": {"x": float(hip_x), "y": float(hip_y)}
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Analysis error: {str(e)}"
        }


if __name__ == "__main__":
    # Command line arguments
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python posture_analysis.py <image_path> <model_path>"
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2]
    
    # Check file existence
    if not os.path.exists(image_path):
        print(json.dumps({
            "success": False,
            "error": f"Image file not found: {image_path}"
        }))
        sys.exit(1)
    
    if not os.path.exists(model_path):
        print(json.dumps({
            "success": False,
            "error": f"Model file not found: {model_path}"
        }))
        sys.exit(1)
    
    # Run analysis
    result = analyze_posture(image_path, model_path)
    print(json.dumps(result, ensure_ascii=False))
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)
