import cv2
import numpy as np
import onnxruntime as ort
import os
import sys

# ==========================================
#        AYARLAR (TÜRKÇE KARAKTER DOSTU)
# ==========================================
# Resim yolunda 'ü', 'ş' vb. olsa da artık çalışır.
RESIM_YOLU = r"C:\Users\kenan\PycharmProjects\spineAI\Postür Tespiti\6.jpeg"

MODEL_YOLU = "best postur.onnx"
KAYIT_KLASORU = "postur_sonuc_onnx"

# --- KONTROLLER ---
if not os.path.exists(RESIM_YOLU):
    # Dosya gerçekten yoksa uyar
    sys.exit(f"HATA: Dosya fiziksel olarak bulunamadı! Yolun doğru mu? -> {RESIM_YOLU}")

if not os.path.exists(MODEL_YOLU):
    print(f"HATA: Model bulunamadı -> {MODEL_YOLU}")
    print("Lütfen şu komutla modeli oluştur: yolo export model=yolov8n-pose.pt format=onnx")
    sys.exit()

if not os.path.exists(KAYIT_KLASORU): os.makedirs(KAYIT_KLASORU)


# ==========================================
#    ONNX POSE CLASS
# ==========================================
class YOLO_Pose_ONNX:
    def __init__(self, model_path):
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.img_size = (640, 640)

    def resim_oku_turkce(self, img_path):
        """
        OpenCV'nin Türkçe karakterli yolları okuyamaması sorununu çözer.
        """
        try:
            # Dosyayı binary olarak okuyup OpenCV formatına çeviriyoruz
            img_array = np.fromfile(img_path, np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"Resim okuma hatası: {e}")
            return None

    def predict(self, img_path):
        # 1. Resmi Özel Fonksiyonla Yükle (Türkçe karakter düzeltmesi)
        img = self.resim_oku_turkce(img_path)

        if img is None:
            print(f"KRİTİK HATA: Resim okunamadı! Yol: {img_path}")
            return None, None

        h, w = img.shape[:2]

        # 2. Ön İşleme
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, self.img_size)
        input_tensor = img_resized.transpose(2, 0, 1)
        input_tensor = np.expand_dims(input_tensor, axis=0).astype(np.float32) / 255.0

        # 3. Tahmin
        outputs = self.session.run(None, {self.input_name: input_tensor})

        # 4. Sonuç İşleme
        output = np.transpose(np.squeeze(outputs[0]))

        if output.shape[0] == 0: return None, img

        scores = output[:, 4]
        best_idx = np.argmax(scores)

        if scores[best_idx] < 0.5: return None, img

        kpts_raw = output[best_idx, 5:]
        kpts = []

        x_scale = w / 640
        y_scale = h / 640

        for i in range(0, len(kpts_raw), 3):
            kx = kpts_raw[i] * x_scale
            ky = kpts_raw[i + 1] * y_scale
            kpts.append([kx, ky])

        return np.array(kpts), img


# ==========================================
#        ANA DÖNGÜ
# ==========================================
try:
    print(f"Dr. AI Posture Analysis (ONNX) running: '{os.path.basename(RESIM_YOLU)}'...")

    detector = YOLO_Pose_ONNX(MODEL_YOLU)
    kpts, img = detector.predict(RESIM_YOLU)

    if kpts is not None and img is not None:
        h_img, w_img, _ = img.shape

        # Koordinatlar
        burun_x = kpts[0][0]
        kulak_x = (kpts[3][0] + kpts[4][0]) / 2
        kulak_y = (kpts[3][1] + kpts[4][1]) / 2
        omuz_x = (kpts[5][0] + kpts[6][0]) / 2
        omuz_y = (kpts[5][1] + kpts[6][1]) / 2
        kalca_x = (kpts[11][0] + kpts[12][0]) / 2
        kalca_y = (kpts[11][1] + kpts[12][1]) / 2

        # Yön ve Analiz
        if burun_x > omuz_x:
            yon = "RIGHT"
            yon_katsayisi = 1
        else:
            yon = "LEFT"
            yon_katsayisi = -1

        govde_boyu = abs(kalca_y - omuz_y)
        if govde_boyu == 0: govde_boyu = 1

        bas_farki = (kulak_x - omuz_x) * yon_katsayisi
        bas_durumu = "NORMAL"
        renk_bas = (0, 255, 0)

        if bas_farki > (govde_boyu * 0.15):
            bas_durumu = "FORWARD HEAD POSTURE"
            renk_bas = (0, 0, 255)
        elif bas_farki < -(govde_boyu * 0.10):
            bas_durumu = "BACKWARD HEAD POSTURE"
            renk_bas = (0, 165, 255)

        omuz_farki = (omuz_x - kalca_x) * yon_katsayisi
        kambur_durumu = "BACK ALIGNED"
        renk_kambur = (0, 255, 0)

        if omuz_farki > (govde_boyu * 0.12):
            kambur_durumu = "KYPHOSIS (SLOUCHING)"
            renk_kambur = (0, 0, 255)

        # Çizim
        cv2.line(img, (int(kulak_x), int(kulak_y)), (int(omuz_x), int(omuz_y)), (255, 0, 255), 3)
        cv2.line(img, (int(omuz_x), int(omuz_y)), (int(kalca_x), int(kalca_y)), (255, 0, 255), 3)
        # Referans çizgisi
        cv2.line(img, (int(kalca_x), int(kalca_y)), (int(kalca_x), int(omuz_y) - 50), (200, 200, 200), 1, cv2.LINE_AA)

        cv2.circle(img, (int(kulak_x), int(kulak_y)), 8, renk_bas, -1)
        cv2.circle(img, (int(omuz_x), int(omuz_y)), 8, renk_kambur, -1)
        cv2.circle(img, (int(kalca_x), int(kalca_y)), 8, (255, 0, 0), -1)

        # Rapor Kutusu
        cv2.rectangle(img, (0, 0), (700, 160), (0, 0, 0), -1)
        cv2.putText(img, f"DIRECTION: {yon}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        cv2.putText(img, f"NECK: {bas_durumu}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, renk_bas, 2)
        cm_sapma_bas = (bas_farki / govde_boyu) * 50
        cv2.putText(img, f"Deviation: {cm_sapma_bas:.1f} cm (Ref)", (450, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (200, 200, 200), 1)
        cv2.putText(img, f"BACK:  {kambur_durumu}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, renk_kambur, 2)
        cm_sapma_omuz = (omuz_farki / govde_boyu) * 50
        cv2.putText(img, f"Tilt: {cm_sapma_omuz:.1f} cm (Ref)", (450, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (200, 200, 200), 1)

        genel_renk = (0, 255, 0)
        genel_yorum = "HEALTHY POSTURE"
        if "POSTURE" in bas_durumu or "KYPHOSIS" in kambur_durumu:
            genel_yorum = "CONSULT A DOCTOR"
            genel_renk = (0, 165, 255)
        cv2.putText(img, f"RESULT: {genel_yorum}", (10, 145), cv2.FONT_HERSHEY_SIMPLEX, 0.7, genel_renk, 2)

        # Kaydet
        # Türkçe karakter sorunu olmasın diye dosya adını 'output.jpg' gibi basit bir şey de yapabilirsin
        dosya_adi_yeni = f"Analysis_ONNX_{os.path.basename(RESIM_YOLU)}"
        hedef_yol = os.path.join(KAYIT_KLASORU, dosya_adi_yeni)

        # Kaydederken de özel yöntem (Türkçe karakter varsa)
        is_success, im_buf_arr = cv2.imencode(".jpg", img)
        if is_success:
            im_buf_arr.tofile(hedef_yol)
            print(f"Analysis Complete! Report saved at: {hedef_yol}")
        else:
            print("Kaydetme hatası oluştu.")

    else:
        print("Analysis Failed: Either the person was not detected or the image path is wrong.")

except Exception as e:
    print(f"An error occurred: {e}")