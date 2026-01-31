#!/usr/bin/env python3
"""
Spine Disease Detection System
Detects spine diseases using trained YOLO model
"""

from ultralytics import YOLO
import cv2
import numpy as np
import math
import sys
import json
import os


def smooth_points(points, window_size=3):
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


def calculate_cobb_angle(centers):
    """Calculate Cobb angle for spine curvature"""
    if len(centers) < 5:
        return 0, []
    
    smooth_pts = smooth_points(centers)
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


def analyze_image_type(boxes):
    """Determine image type (AP or LATERAL)"""
    ratios = [(b[2] - b[0]) / (b[3] - b[1]) for b in boxes]
    avg = np.mean(ratios)
    # Vertebrae appear wider in AP views
    return "AP" if avg > 1.35 else "LATERAL"


def detect_diseases(vertebrae, centers, heights, avg_height, image_type):
    """Detect spine diseases using geometric analysis"""
    findings = {
        "compression_fracture": 0,
        "herniated_disc": 0,
        "listhesis": 0
    }
    
    # If no vertebrae detected, return empty findings
    if len(vertebrae) == 0:
        return findings
    
    for i, v in enumerate(vertebrae):
        h = v[3] - v[1]  # Height
        w = v[2] - v[0]  # Width
        cx = centers[i][0]  # X center coordinate
        
        # 1. COMPRESSION FRACTURE - Strict criteria
        # Only flag if height loss is very significant (>40%)
        if i > 0 and i < len(vertebrae) - 1:
            local_avg = (heights[i - 1] + heights[i + 1]) / 2
            if h < (local_avg * 0.60):  # More than 40% height loss
                findings["compression_fracture"] += 1
        
        # 2. LISTHESIS - Strict alignment check
        # Only flag if severely misaligned
        if i > 0 and i < len(vertebrae) - 1:
            prev_x = centers[i - 1][0]
            next_x = centers[i + 1][0]
            expected_x = (prev_x + next_x) / 2
            
            # Much stricter tolerance
            tolerance = 0.35 if image_type == "AP" else 0.40
            
            if abs(cx - expected_x) > (w * tolerance):
                findings["listhesis"] += 1
        
        # 3. DISC HERNIATION - Very strict space check
        # Only flag if space is critically narrow
        if i < len(vertebrae) - 1:
            space = vertebrae[i + 1][1] - v[3]
            ref_h = (h + heights[i + 1]) / 2
            
            # Much stricter limit
            limit = 0.08 if image_type == "LATERAL" else 0.06
            
            if space < (ref_h * limit) and space > 0:
                findings["herniated_disc"] += 1
    
    return findings


def analyze_spine(image_path, model_path):
    """Main analysis function"""
    try:
        # 1. Load YOLO model
        model = YOLO(model_path)
        
        # 2. Analyze image
        results = model.predict(
            source=image_path,
            save=False,
            conf=0.25,  # Minimum confidence threshold
            verbose=False
        )
        
        # 3. Get detected vertebrae
        boxes = results[0].boxes.data.cpu().numpy()
        
        if len(boxes) < 3:
            return {
                "success": False,
                "error": "⚠️ Insufficient vertebrae detected. This appears to be a POSTURE PHOTO. Please use 'Posture Photo Analysis' instead of 'Spine X-Ray Analysis'."
            }
        
        # 4. Sort vertebrae by vertical position (top to bottom)
        vertebrae = sorted([b for b in boxes], key=lambda x: (x[1] + x[3]) / 2)
        
        # 5. Determine image type
        image_type = analyze_image_type(vertebrae)
        
        # 6. Calculate vertebral centers and heights
        centers = []
        heights = []
        
        for v in vertebrae:
            cx = int((v[0] + v[2]) / 2)  # X center
            cy = int((v[1] + v[3]) / 2)  # Y center
            centers.append((cx, cy))
            heights.append(v[3] - v[1])
        
        avg_height = np.mean(heights)
        
        # 7. Detect diseases using geometric analysis
        findings = detect_diseases(vertebrae, centers, heights, avg_height, image_type)
        
        # 8. Calculate Cobb angle
        cobb_angle, _ = calculate_cobb_angle(centers)
        
        # 9. Determine severity and generate recommendations
        severity = "normal"
        consult_doctor = False
        recommendations = []
        
        # Compression fracture - most critical condition
        if findings["compression_fracture"] > 0:
            severity = "critical"
            consult_doctor = True
            recommendations.append(f"⚠️ URGENT: Compression fracture detected ({findings['compression_fracture']} location(s))! Emergency orthopedic consultation required.")
        
        # Disc herniation
        if findings["herniated_disc"] > 0:
            if severity == "normal":
                severity = "moderate"
            consult_doctor = True
            recommendations.append(f"⚠️ Disc herniation detected ({findings['herniated_disc']} region(s)). Medical examination required.")
        
        # Vertebral slip
        if findings["listhesis"] > 0:
            if severity == "normal":
                severity = "moderate"
            consult_doctor = True
            recommendations.append(f"⚠️ Vertebral slip (listhesis) detected ({findings['listhesis']} region(s)). Doctor consultation recommended.")
        
        # Scoliosis check (AP views)
        if image_type == "AP" and cobb_angle > 10:
            if severity == "normal":
                severity = "moderate"
            consult_doctor = True
            recommendations.append(f"⚠️ Scoliosis detected (Cobb angle: {cobb_angle:.1f}°). Consult an orthopedic specialist.")
        
        # Lordosis check (LATERAL views)
        if image_type == "LATERAL":
            if cobb_angle < 20:
                if severity == "normal":
                    severity = "moderate"
                consult_doctor = True
                recommendations.append(f"⚠️ Lordosis flattening detected (Angle: {cobb_angle:.1f}°). Medical examination recommended.")
            elif cobb_angle > 60:
                if severity == "normal":
                    severity = "moderate"
                consult_doctor = True
                recommendations.append(f"⚠️ Excessive lordosis detected (Angle: {cobb_angle:.1f}°). Doctor consultation required.")
        
        # Normal condition
        if not consult_doctor:
            recommendations.append("✅ Normal spine anatomy detected. Routine check-ups recommended.")
        
        # 10. Calculate health score (0-100)
        score = max(0, 100 - (
            findings["compression_fracture"] * 30 +
            findings["herniated_disc"] * 20 +
            findings["listhesis"] * 15
        ))
        
        # 11. Return results
        return {
            "success": True,
            "imageType": image_type,
            "cobbAngle": round(cobb_angle, 2),
            "vertebraeCount": len(vertebrae),
            "findings": findings,
            "severity": severity,
            "consultDoctor": consult_doctor,
            "recommendations": recommendations,
            "score": int(score)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Analysis error: {str(e)}"
        }


if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python spine_analysis.py <image_path> <model_path>"
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
    
    # Run analysis and print result
    result = analyze_spine(image_path, model_path)
    print(json.dumps(result, ensure_ascii=False))
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)
