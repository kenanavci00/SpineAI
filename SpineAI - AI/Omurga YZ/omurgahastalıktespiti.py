from ultralytics import YOLO
import cv2
import numpy as np
import math
import os
import sys

# ==========================================
#        SETTINGS (V12 - PLATINUM ENGLISH)
# ==========================================
GIRIS_YOLU = r"C:\Users\kenan\Desktop\1.jpeg"  # Path to image or folder
MODEL_YOLU = r"C:\Users\kenan\PycharmProjects\spineAI\runs\detect\omurga\weights\best.pt"
KAYIT_KLASORU = r"C:\Users\kenan\Desktop\Reports_Doctor_V12_Platinum_EN"

if not os.path.exists(GIRIS_YOLU): sys.exit(f"ERROR: Input not found -> {GIRIS_YOLU}")
if not os.path.exists(KAYIT_KLASORU): os.makedirs(KAYIT_KLASORU)

print(f"Dr. AI V12 (Clean Medical View) Starting...")
try:
    model = YOLO(MODEL_YOLU)
except Exception as e:
    sys.exit(f"Model Load Error: {e}")

# Determine Input Type
resimler = []
CALISMA_KLASORU = ""
if os.path.isfile(GIRIS_YOLU):
    klasor, dosya = os.path.split(GIRIS_YOLU)
    resimler = [dosya]
    CALISMA_KLASORU = klasor
else:
    resimler = [f for f in os.listdir(GIRIS_YOLU) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    CALISMA_KLASORU = GIRIS_YOLU

print(f"Number of Patients: {len(resimler)}\n")


# ==========================================
#        MATH ENGINE (V12)
# ==========================================

def smooth_points(points, window_size=3):
    """Smooths the spinal line (Noise Reduction)."""
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


def smart_cobb_angle_v12(img, merkezler):
    """
    Simulates the doctor's measurement method.
    Finds the angle of lines tangent to limit vertebrae.
    """
    if len(merkezler) < 5: return 0, [], None, None, 0, 0

    # 1. Smoothing
    smooth_pts = smooth_points(merkezler)

    angles = []
    valid_indices = []

    # 2. Smart Trimming (Ignore natural curves at ends)
    start_trim = 2
    end_trim = len(smooth_pts) - 2
    if start_trim >= end_trim: start_trim, end_trim = 0, len(smooth_pts)

    # 3. Vectorial Angle Scanning
    for i in range(start_trim, end_trim):
        p_prev = smooth_pts[i - 1]
        p_next = smooth_pts[i + 1]
        dy = p_next[1] - p_prev[1]
        dx = p_next[0] - p_prev[0]
        if dy == 0: dy = 0.001
        angle = math.degrees(math.atan(dx / dy))
        angles.append(angle)
        valid_indices.append(i)

    if not angles: return 0, smooth_pts, None, None, 0, 0

    # 4. Limit Vertebra Detection
    max_angle = np.max(angles)
    min_angle = np.min(angles)
    cobb_val = max_angle - min_angle

    idx_max = valid_indices[np.argmax(angles)]
    idx_min = valid_indices[np.argmin(angles)]

    return cobb_val, smooth_pts, smooth_pts[idx_max], smooth_pts[idx_min], max_angle, min_angle


def goruntu_tipi_analiz_et(boxes):
    oranlar = [(b[2] - b[0]) / (b[3] - b[1]) for b in boxes]
    avg = np.mean(oranlar)
    return "AP (FRONTAL)" if avg > 1.35 else "LATERAL (SIDE)"


def doktor_limit_cizgisi(img, merkez, aci, renk):
    """
    Draws a line perpendicular to the vertebra slope, just like doctors do.
    """
    if merkez is None: return
    cx, cy = merkez
    length = 250  # Line length

    # Angle is deviation from vertical. Convert for horizontal perpendicular line.
    rad = math.radians(aci)

    # Slope line
    dx = int(length * math.cos(rad))
    dy = int(length * math.sin(rad))

    p1 = (cx - dx, cy + dy)
    p2 = (cx + dx, cy - dy)

    # Draw Line
    cv2.line(img, p1, p2, renk, 2, cv2.LINE_AA)
    # Center dot
    cv2.circle(img, (cx, cy), 6, renk, -1)


# ==========================================
#        MODERN REPORT PANEL
# ==========================================

def rapor_paneli_ciz(img, dosya_adi, goruntu_tipi, derece, bulgular):
    h, w = img.shape[:2]
    font_scale = max(0.60, h / 1100)
    thickness = max(1, int(font_scale * 2))
    line_h = int(45 * font_scale)

    txts = ["AI RADIOLOGY REPORT", "RETROLISTHESIS: 10", f"ID: {dosya_adi}"]
    max_w = max([cv2.getTextSize(t, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0][0] for t in txts])
    panel_w = max_w + 80

    # Panel Background (Light Gray)
    canvas = np.full((h, w + panel_w, 3), 30, dtype=np.uint8)  # Dark Gray
    canvas[:, :w] = img

    x = w + 20
    y = 50

    # HEADER
    cv2.putText(canvas, "AI RADIOLOGY", (x, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale * 1.1, (0, 255, 255), thickness)
    y += int(line_h * 1.5)

    cv2.putText(canvas, f"ID: {dosya_adi[:18]}", (x, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale * 0.7, (200, 200, 200), 1)
    y += int(line_h * 1.5)

    # ANGLE
    baslik = "SCOLIOSIS (Cobb)" if "AP" in goruntu_tipi else "LORDOSIS / KYPHOSIS"
    cv2.putText(canvas, f"{baslik}:", (x, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), 1)
    y += line_h

    aci_renk = (0, 255, 0)
    yorum = ""

    if "AP" in goruntu_tipi:
        if derece > 10: aci_renk = (0, 0, 255); yorum = "SCOLIOSIS (+)"
    else:
        if derece < 20:
            aci_renk = (0, 0, 255); yorum = "HYPOLORDOSIS (Flat)"
        elif derece > 60:
            aci_renk = (0, 165, 255); yorum = "HYPERLORDOSIS"

    cv2.putText(canvas, f"{derece:.1f} Degrees", (x, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale * 1.4, aci_renk,
                thickness + 1)
    y += line_h
    if yorum:
        cv2.putText(canvas, yorum, (x, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale * 0.8, aci_renk, 1)
        y += line_h

    y += int(line_h * 0.5)

    # FINDINGS LIST
    cv2.putText(canvas, "FINDINGS:", (x, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)
    y += line_h

    def satir(lbl, key, renk):
        nonlocal y
        val = bulgular[key]
        # If disease present use vivid color, else dim gray
        c = renk if val > 0 else (80, 80, 80)
        t_c = (255, 255, 255) if val > 0 else (120, 120, 120)
        t = f"{lbl}: {val}" if val > 0 else f"{lbl}: NONE"

        cv2.circle(canvas, (x + 15, y - 8), int(6 * font_scale), c, -1)
        cv2.putText(canvas, t, (x + 35, y), cv2.FONT_HERSHEY_SIMPLEX, font_scale * 0.75, t_c, 1)
        y += line_h

    satir("Compression Frac.", "cokme", (0, 0, 255))  # Red
    satir("Disc Herniation", "fitik", (255, 0, 255))  # Magenta
    satir("Spondylolisthesis", "kayma", (0, 165, 255))  # Orange

    # RESULT BOX
    y += 30
    risk = sum(bulgular.values()) + (1 if yorum else 0)
    bg = (0, 0, 200) if risk > 0 else (0, 180, 0)  # Solid colors
    msg = "PATHOLOGY DETECTED" if risk > 0 else "NORMAL"

    cv2.rectangle(canvas, (w + 20, y), (w + panel_w - 20, y + int(line_h * 1.8)), bg, -1)

    ts = cv2.getTextSize(msg, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
    tx = (w + 20) + ((panel_w - 40) - ts[0]) // 2
    ty = y + (int(line_h * 1.8) + ts[1]) // 2
    cv2.putText(canvas, msg, (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)

    return canvas


# ==========================================
#        MAIN LOOP (V12)
# ==========================================

for dosya_adi in resimler:
    tam_yol = os.path.join(CALISMA_KLASORU, dosya_adi)
    print(f"> Analyzing: {dosya_adi}")

    try:
        results = model.predict(source=tam_yol, save=False, conf=0.25, verbose=False)
        boxes = results[0].boxes.data.cpu().numpy()

        if len(boxes) > 2:
            img = cv2.imread(tam_yol)
            kemikler = sorted([b for b in boxes], key=lambda x: (x[1] + x[3]) / 2)
            goruntu_tipi = goruntu_tipi_analiz_et(kemikler)

            merkezler = []
            yukseklikler = []
            for k in kemikler:
                cx = int((k[0] + k[2]) / 2)
                cy = int((k[1] + k[3]) / 2)
                merkezler.append((cx, cy))
                yukseklikler.append(k[3] - k[1])

            avg_h = np.mean(yukseklikler)
            bulgular = {"cokme": 0, "fitik": 0, "kayma": 0}

            # --- DISEASE DETECTION AND DRAWING ---
            for i, k in enumerate(kemikler):
                x1, y1, x2, y2 = int(k[0]), int(k[1]), int(k[2]), int(k[3])
                h = y2 - y1
                w = x2 - x1
                cx, cy = merkezler[i]

                hastalik_var = False

                # 1. Spondylolisthesis (Sliding)
                if i > 0 and i < len(kemikler) - 1:
                    prev_x = merkezler[i - 1][0]
                    next_x = merkezler[i + 1][0]
                    bk_x = (prev_x + next_x) / 2
                    tol = 0.25 if "AP" in goruntu_tipi else 0.30
                    if abs(cx - bk_x) > (w * tol):
                        # Orange Box for Sliding
                        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 165, 255), 3)
                        bulgular["kayma"] += 1
                        hastalik_var = True

                # 2. Compression Fracture
                local_avg = avg_h
                if i > 0 and i < len(kemikler) - 1: local_avg = (yukseklikler[i - 1] + yukseklikler[i + 1]) / 2
                if h < (local_avg * 0.70):
                    # Red Box for Fracture
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3)
                    bulgular["cokme"] += 1
                    hastalik_var = True

                # 3. Disc Herniation - NO BOX, JUST LINE
                if i < len(kemikler) - 1:
                    bosluk = kemikler[i + 1][1] - k[3]
                    ref_h = (h + yukseklikler[i + 1]) / 2
                    limit = 0.13 if "LATERAL" in goruntu_tipi else 0.09

                    if bosluk < (ref_h * limit) and bosluk > 0:
                        mid = int(y2 + bosluk / 2)
                        # Thick MAGENTA Line only
                        cv2.line(img, (x1 + 5, mid), (x2 - 5, mid), (255, 0, 255), 4)
                        if "fitik" not in bulgular: bulgular["fitik"] += 1

                # 4. Healthy Bone (No Green Box)
                # Just a small turquoise dot for doctor tracking
                if not hastalik_var:
                    cv2.circle(img, (cx, cy), 3, (255, 255, 0), -1)

            # --- ANGLE ANALYSIS ---
            cobb_val, smooth_pts, p_max, p_min, ang_max, ang_min = smart_cobb_angle_v12(img, merkezler)

            # Main Spine Line (Yellow)
            if len(smooth_pts) > 0:
                pts_arr = np.array(smooth_pts, np.int32)
                cv2.polylines(img, [pts_arr], False, (0, 255, 255), 2)

            # Doctor's Reference Lines (Limit Vertebra Tangents)
            # White/Gray color
            if p_max is not None: doktor_limit_cizgisi(img, p_max, ang_max, (220, 220, 220))
            if p_min is not None: doktor_limit_cizgisi(img, p_min, ang_min, (220, 220, 220))

            # Report Generation
            final_img = rapor_paneli_ciz(img, dosya_adi, goruntu_tipi, cobb_val, bulgular)

            hedef = os.path.join(KAYIT_KLASORU, f"DrV12_EN_{dosya_adi}")
            cv2.imwrite(hedef, final_img)
            print(f"   -> Success: {cobb_val:.2f} Degrees")

        else:
            print("   -> Spine not found.")

    except Exception as e:
        print(f"   -> Error: {e}")

print(f"\nProcessing Complete: {KAYIT_KLASORU}")