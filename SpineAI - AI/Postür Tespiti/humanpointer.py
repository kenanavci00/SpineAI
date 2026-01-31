from ultralytics import YOLO
import cv2

# 1. Hazır Pose Modelini Yükle (Eğitmene gerek yok, indirip çalıştırır)
model = YOLO("yolov8n-pose.pt")

# 2. Test Edeceğin İnsan Resmi (Yandan çekilmiş bir foto)
resim_yolu = "insan_yandan.jpg"

# 3. Tahmin Yap
results = model.predict(source=resim_yolu, save=True, conf=0.5)

# 4. Sonuçları Göster (İskelet çizer)
# Keypoint verilerine erişmek için:
for result in results:
    keypoints = result.keypoints.xy.cpu().numpy()[0]  # [17, 2] boyutunda dizi (x, y)

    # İndeksler (COCO Formatı):
    # 3: Sol Kulak, 4: Sağ Kulak
    # 5: Sol Omuz, 6: Sağ Omuz
    # 11: Sol Kalça, 12: Sağ Kalça

    print("Sol Kulak:", keypoints[3])
    print("Sol Omuz:", keypoints[5])
    print("Sol Kalça:", keypoints[11])

print("İşlem tamam! 'runs/pose/predict' klasörüne bak.")