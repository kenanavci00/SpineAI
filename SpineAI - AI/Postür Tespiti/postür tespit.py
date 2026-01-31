from ultralytics import YOLO
import cv2
import numpy as np
import os
import math

# --- SETTINGS ---
RESIM_ADI = "6.jpeg"  # Write the image name here
MEVCUT_KLASOR = os.getcwd()
RESIM_YOLU = os.path.join(MEVCUT_KLASOR, RESIM_ADI)

# --- SAVE FOLDER ---
KAYIT_KLASORU = "postur_sonuc"
if not os.path.exists(KAYIT_KLASORU):
    os.makedirs(KAYIT_KLASORU)

try:
    # 1. Load Model
    model = YOLO("yolov8n-pose.pt")

    # 2. Prediction
    print(f"Dr. AI Posture Analysis running: '{RESIM_ADI}' is being scanned...")
    results = model.predict(source=RESIM_YOLU, save=False, conf=0.5, verbose=False)

    if results and len(results[0].keypoints) > 0:
        # Get first person
        kpts = results[0].keypoints.xy.cpu().numpy()[0]

        # Check if enough keypoints exist
        if kpts.shape[0] > 0:
            img = cv2.imread(RESIM_YOLU)
            h_img, w_img, _ = img.shape

            # --- COORDINATES (Average of Left and Right) ---
            # Nose (0), Ear (3,4), Shoulder (5,6), Hip (11,12)

            burun_x = kpts[0][0]
            kulak_x = (kpts[3][0] + kpts[4][0]) / 2
            kulak_y = (kpts[3][1] + kpts[4][1]) / 2

            omuz_x = (kpts[5][0] + kpts[6][0]) / 2
            omuz_y = (kpts[5][1] + kpts[6][1]) / 2

            kalca_x = (kpts[11][0] + kpts[12][0]) / 2
            kalca_y = (kpts[11][1] + kpts[12][1]) / 2

            # --- STEP 1: DIRECTION DETECTION (COMPASS) ---
            # If nose is to the right of shoulder, person is facing right.
            # Direction coefficient: 1 for Right, -1 for Left
            if burun_x > omuz_x:
                yon = "RIGHT"
                yon_katsayisi = 1
            else:
                yon = "LEFT"
                yon_katsayisi = -1

            print(f"Detected Facing Direction: {yon}")

            # --- STEP 2: REFERENCE LENGTH (TORSO HEIGHT) ---
            # Using ratio instead of pixels for zoom invariance.
            # Torso height (Vertical distance from Shoulder to Hip) is our ruler.
            govde_boyu = abs(kalca_y - omuz_y)
            if govde_boyu == 0: govde_boyu = 1  # Prevent division by zero

            # --- ANALYSIS 1: FORWARD HEAD POSTURE ---
            # How far forward is the Ear compared to the Shoulder? (Corrected for direction)
            bas_farki = (kulak_x - omuz_x) * yon_katsayisi

            # Threshold: If forward more than 15% of torso height, it's an issue.
            bas_durumu = "NORMAL"
            renk_bas = (0, 255, 0)  # Green

            if bas_farki > (govde_boyu * 0.15):
                bas_durumu = "FORWARD HEAD POSTURE"
                renk_bas = (0, 0, 255)  # Red
            elif bas_farki < -(govde_boyu * 0.10):
                bas_durumu = "BACKWARD HEAD POSTURE"  # Rare
                renk_bas = (0, 165, 255)  # Orange

            # --- ANALYSIS 2: KYPHOSIS / SLOUCHING ---
            # How far forward is the Shoulder compared to the Hip? (Corrected for direction)
            # Normally shoulder and hip should be aligned.
            omuz_farki = (omuz_x - kalca_x) * yon_katsayisi

            # Threshold: If shoulder is forward more than 12% of torso height.
            kambur_durumu = "BACK ALIGNED"
            renk_kambur = (0, 255, 0)

            if omuz_farki > (govde_boyu * 0.12):
                kambur_durumu = "KYPHOSIS (SLOUCHING)"
                renk_kambur = (0, 0, 255)

            # --- VISUALIZATION AND DRAWING ---

            # 1. Skeleton Lines
            cv2.line(img, (int(kulak_x), int(kulak_y)), (int(omuz_x), int(omuz_y)), (255, 0, 255), 3)  # Neck
            cv2.line(img, (int(omuz_x), int(omuz_y)), (int(kalca_x), int(kalca_y)), (255, 0, 255), 3)  # Back

            # 2. Reference Vertical Lines (Up from Hip)
            cv2.line(img, (int(kalca_x), int(kalca_y)), (int(kalca_x), int(omuz_y) - 50), (200, 200, 200), 1,
                     cv2.LINE_AA)  # Gray Reference

            # 3. Points
            cv2.circle(img, (int(kulak_x), int(kulak_y)), 8, renk_bas, -1)
            cv2.circle(img, (int(omuz_x), int(omuz_y)), 8, renk_kambur, -1)
            cv2.circle(img, (int(kalca_x), int(kalca_y)), 8, (255, 0, 0), -1)

            # --- REPORT BOX ---
            # Black box at the top
            cv2.rectangle(img, (0, 0), (700, 160), (0, 0, 0), -1)

            # Headers
            cv2.putText(img, f"DIRECTION: {yon}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            # Neck Result
            cv2.putText(img, f"NECK: {bas_durumu}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, renk_bas, 2)
            # Distance detail (Estimated cm assuming avg torso is 50cm)
            cm_sapma_bas = (bas_farki / govde_boyu) * 50
            cv2.putText(img, f"Deviation: {cm_sapma_bas:.1f} cm (Ref)", (450, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                        (200, 200, 200), 1)

            # Back Result
            cv2.putText(img, f"BACK:  {kambur_durumu}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, renk_kambur, 2)
            cm_sapma_omuz = (omuz_farki / govde_boyu) * 50
            cv2.putText(img, f"Tilt: {cm_sapma_omuz:.1f} cm (Ref)", (450, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                        (200, 200, 200), 1)

            # General Comment
            genel_renk = (0, 255, 0)
            if "POSTURE" in bas_durumu or "KYPHOSIS" in kambur_durumu:
                genel_yorum = "CONSULT A DOCTOR"
                genel_renk = (0, 165, 255)
            else:
                genel_yorum = "HEALTHY POSTURE"

            cv2.putText(img, f"RESULT: {genel_yorum}", (10, 145), cv2.FONT_HERSHEY_SIMPLEX, 0.7, genel_renk, 2)

            # --- SAVE ---
            dosya_adi_yeni = f"Analysis_{RESIM_ADI}"
            hedef_yol = os.path.join(KAYIT_KLASORU, dosya_adi_yeni)
            cv2.imwrite(hedef_yol, img)

            print(f"Analysis Complete! Report saved at: {hedef_yol}")
            cv2.imshow("Advanced Posture Analysis", img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()

        else:
            print("Keypoints not found.")
    else:
        print("Person not detected.")

except FileNotFoundError:
    print(f"ERROR: File '{RESIM_ADI}' not found.")
except Exception as e:
    print(f"An error occurred: {e}")