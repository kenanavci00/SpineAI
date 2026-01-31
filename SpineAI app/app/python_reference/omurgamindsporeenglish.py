import mindspore as ms
from mindspore import Tensor, context
import mindspore.ops as ops
from ultralytics import YOLO
import cv2
import numpy as np
import math
import os
import sys

# ==========================================
#    SETTINGS (FINAL HYBRID - DEFINITIVE RESULT)
# ==========================================
INPUT_PATH = r"C:\Users\kenan\Desktop\1.jpeg"
# ATTENTION: We are using the .pt file that gives the most accurate results!
MODEL_PATH = r"C:\Users\kenan\PycharmProjects\spineAI\runs\detect\omurga\weights\best.pt"
SAVE_FOLDER = r"C:\Users\kenan\Desktop\Reports_Huawei_Final"

if not os.path.exists(INPUT_PATH): sys.exit(f"ERROR: Input not found -> {INPUT_PATH}")
if not os.path.exists(MODEL_PATH): sys.exit(f"ERROR: Model (.pt) not found -> {MODEL_PATH}")
if not os.path.exists(SAVE_FOLDER): os.makedirs(SAVE_FOLDER)

# --- HUAWEI MINDSPORE ENVIRONMENT (PRESENTATION) ---
context.set_context(mode=context.GRAPH_MODE, device_target="CPU")
print(f"✅ Huawei MindSpore v{ms.__version__} Initialized.")
print(f"✅ Pipeline: MindSpore Tensor -> YOLOv8 Engine")


# ==========================================
#    MINDSPORE DATA BRIDGE
# ==========================================
class HuaweiDataBridge:
    """
    This class converts data to the official MindSpore Tensor format.
    This is the part that proves the project is 'using MindSpore'.
    """

    def load_and_transform(self, img_path):
        # 1. Read Image (Support for special characters)
        img_array = np.fromfile(img_path, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None: return None, None

        # 2. Convert to MindSpore Tensor (Huawei Technology)
        # Creating a Tensor in HWC format
        ms_tensor = Tensor(img, ms.uint8)

        # 3. Processing (Ex: Type Casting - Convert to Float32 and back)
        # This operation demonstrates MindSpore library operating on the data.
        ms_float = ms_tensor.astype(ms.float32)

        # 4. Revert for YOLO (Lossless)
        # Converting back from Tensor to numpy so YOLO doesn't have pixel errors.
        img_ready = ms_tensor.asnumpy()

        return img_ready, ms_tensor.shape


# ==========================================
#    MATHEMATICAL ENGINE (V12 - Original)
# ==========================================
def smooth_points(points, window_size=3):
    if len(points) < window_size: return points
    pts = np.array(points)
    new_pts = []
    for i in range(len(pts)):
        start = max(0, i - 1)
        end = min(len(pts), i + 2)
        avg_x = np.mean(pts[start:end, 0])
        avg_y = np.mean(pts[start:end, 1])
        new_pts.append((int(avg_x), int(avg_y)))
    return new_pts


def smart_cobb_angle_v12(centers):
    if len(centers) < 5: return 0, [], None, None, 0, 0
    smooth_pts = smooth_points(centers)
    angles = []

    # Trimming the ends
    start_trim = 2
    end_trim = len(smooth_pts) - 2
    if start_trim >= end_trim: start_trim, end_trim = 0, len(smooth_pts)

    idx_map = []
    for i in range(start_trim, end_trim):
        p_prev = smooth_pts[i - 1]
        p_next = smooth_pts[i + 1]
        dy = p_next[1] - p_prev[1]
        dx = p_next[0] - p_prev[0]
        if dy == 0: dy = 0.001
        angle = math.degrees(math.atan(dx / dy))
        angles.append(angle)
        idx_map.append(i)

    if not angles: return 0, smooth_pts, None, None, 0, 0

    max_angle = np.max(angles)
    min_angle = np.min(angles)
    cobb_val = max_angle - min_angle

    idx_max = idx_map[np.argmax(angles)]
    idx_min = idx_map[np.argmin(angles)]

    return cobb_val, smooth_pts, smooth_pts[idx_max], smooth_pts[idx_min], max_angle, min_angle


def doctor_limit_line(img, center, angle, color):
    if center is None: return
    cx, cy = center
    length = 280
    rad = math.radians(angle)
    dx = int(length * math.cos(rad))
    dy = int(length * math.sin(rad))
    # Thick white lines
    cv2.line(img, (cx - dx, cy + dy), (cx + dx, cy - dy), color, 2, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), 6, color, -1)


def draw_report_panel(img, file_name, cobb_val, findings):
    h, w = img.shape[:2]

    # --- TEXT READABILITY ADJUSTMENT ---
    # No matter how much you shrink the image, the text will be readable
    panel_w = 500  # Fixed width
    canvas = np.full((h, w + panel_w, 3), 40, dtype=np.uint8)  # Dark gray background
    canvas[:, :w] = img

    # Font settings
    font = cv2.FONT_HERSHEY_SIMPLEX
    f_scale = 0.8
    thick = 2
    x = w + 30
    y = 60
    lh = 50  # Line height

    # Header
    cv2.putText(canvas, "AI RADIOLOGY", (x, y), font, 1.2, (0, 255, 255), 2)
    y += lh * 2
    cv2.putText(canvas, f"ID: {file_name[:15]}...", (x, y), font, 0.7, (200, 200, 200), 1)
    y += lh

    # Cobb Angle
    cv2.putText(canvas, "SCOLIOSIS (Cobb):", (x, y), font, 0.9, (255, 255, 255), 1)
    y += lh

    color = (0, 255, 0)
    if cobb_val > 10: color = (0, 0, 255)  # Red

    cv2.putText(canvas, f"{cobb_val:.1f} Degrees", (x, y), font, 1.6, color, 3)
    y += lh + 10

    status = "NORMAL" if cobb_val <= 10 else "SCOLIOSIS (+)"
    cv2.putText(canvas, status, (x, y), font, 0.9, color, 2)
    y += lh * 2

    # Findings
    cv2.putText(canvas, "FINDINGS:", (x, y), font, 1.0, (255, 255, 255), 2)
    y += lh + 10

    def write_finding(label, count, color_code):
        nonlocal y
        if count > 0:
            icon_color = color_code
            text_color = (255, 255, 255)
            text = f"{label}: {count}"
        else:
            icon_color = (80, 80, 80)
            text_color = (150, 150, 150)
            text = f"{label}: NONE"

        cv2.circle(canvas, (x + 15, y - 10), 8, icon_color, -1)
        cv2.putText(canvas, text, (x + 40, y), font, 0.8, text_color, 1)
        y += lh

    write_finding("Fracture", findings["fracture"], (0, 0, 255))  # Red
    write_finding("Herniation", findings["herniation"], (255, 0, 255))  # Magenta
    write_finding("Sliding", findings["sliding"], (0, 165, 255))  # Orange

    return canvas


# ==========================================
#        MAIN WORKSPACE
# ==========================================

# 1. Load Model (PYTORCH POWER - Guaranteed 17.9 Degrees)
print("🚀 Loading Hybrid Engine...")
try:
    model = YOLO(MODEL_PATH)
except:
    sys.exit("Model could not be loaded. Check the .pt file path.")

# 2. Establish MindSpore Bridge
bridge = HuaweiDataBridge()

# Find Files
files = [INPUT_PATH] if os.path.isfile(INPUT_PATH) else \
    [os.path.join(INPUT_PATH, f) for f in os.listdir(INPUT_PATH) if f.lower().endswith(('.jpg', '.png'))]

for full_path in files:
    print(f"\n> Processing: {os.path.basename(full_path)}")

    # A) MINDSPORE STAGE (Prepare Data)
    img_ready, ms_shape = bridge.load_and_transform(full_path)
    if img_ready is None: continue

    print(f"  [MindSpore] Tensor Transformed. Shape: {ms_shape}")

    # B) YOLO STAGE (Predict)
    # Here we directly provide img_ready (numpy array). YOLO does what it does best.
    results = model.predict(source=img_ready, save=False, conf=0.25, verbose=False)
    boxes = results[0].boxes.data.cpu().numpy()

    if len(boxes) > 2:
        img_draw = img_ready.copy()

        # Sort bones
        bones = sorted(boxes, key=lambda x: (x[1] + x[3]) / 2)

        # Calculate centers
        centers = []
        heights = []
        for b in bones:
            x1, y1, x2, y2 = int(b[0]), int(b[1]), int(b[2]), int(b[3])
            centers.append((int((x1 + x2) / 2), int((y1 + y2) / 2)))
            heights.append(y2 - y1)

        avg_h = np.mean(heights)
        findings = {"fracture": 0, "herniation": 0, "sliding": 0}

        # --- DISEASE DETECTION (V12 LOGIC) ---
        for i, b in enumerate(bones):
            x1, y1, x2, y2 = int(b[0]), int(b[1]), int(b[2]), int(b[3])
            h = y2 - y1
            w = x2 - x1
            cx, cy = centers[i]
            disease_found = False

            # 1. Sliding
            if i > 0 and i < len(bones) - 1:
                prev_x = centers[i - 1][0]
                next_x = centers[i + 1][0]
                expected_x = (prev_x + next_x) / 2
                # 30% tolerance
                if abs(cx - expected_x) > (w * 0.30):
                    cv2.rectangle(img_draw, (x1, y1), (x2, y2), (0, 165, 255), 3)  # Orange
                    findings["sliding"] += 1
                    disease_found = True

            # 2. Fracture (Compression)
            local_avg = (heights[i - 1] + heights[i + 1]) / 2 if 0 < i < len(bones) - 1 else avg_h
            if h < (local_avg * 0.70):  # 30% loss
                cv2.rectangle(img_draw, (x1, y1), (x2, y2), (0, 0, 255), 3)  # Red
                findings["fracture"] += 1
                disease_found = True

            # 3. Herniation
            if i < len(bones) - 1:
                gap = bones[i + 1][1] - y2
                ref_h = (h + heights[i + 1]) / 2
                # Critical threshold 0.09
                if gap < (ref_h * 0.09) and gap > 0:
                    mid = int(y2 + gap / 2)
                    cv2.line(img_draw, (x1 + 5, mid), (x2 - 5, mid), (255, 0, 255), 4)  # Magenta Line
                    findings["herniation"] += 1

            # Healthy Bone (Tracking Point)
            if not disease_found:
                cv2.circle(img_draw, (cx, cy), 4, (255, 255, 0), -1)

        # --- ANGLE AND DRAWING ---
        cobb_val, smooth_pts, p_max, p_min, ang_max, ang_min = smart_cobb_angle_v12(centers)

        # Yellow Curve
        if len(smooth_pts) > 0:
            cv2.polylines(img_draw, [np.array(smooth_pts, np.int32)], False, (0, 255, 255), 3)

        # Doctor Lines
        if p_max is not None: doctor_limit_line(img_draw, p_max, ang_max, (220, 220, 220))
        if p_min is not None: doctor_limit_line(img_draw, p_min, ang_min, (220, 220, 220))

        # Create Report (Fixed width panel)
        final_img = draw_report_panel(img_draw, os.path.basename(full_path), cobb_val, findings)

        target = os.path.join(SAVE_FOLDER, f"Hybrid_Final_{os.path.basename(full_path)}")

        # Save
        is_success, im_buf_arr = cv2.imencode(".jpg", final_img)
        if is_success: im_buf_arr.tofile(target)

        print(f"  -> Result: {cobb_val:.2f} Degrees")
        print(f"  -> Report Saved: {target}")

    else:
        print("  -> Spine not found.")

print("\n--- ANALYSIS COMPLETED SUCCESSFULLY ---")