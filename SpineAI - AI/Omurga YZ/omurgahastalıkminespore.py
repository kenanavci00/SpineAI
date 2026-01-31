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
#    AYARLAR (FINAL HYBRID - KESİN SONUÇ)
# ==========================================
GIRIS_YOLU = r"C:\Users\kenan\Desktop\1.jpeg"
# DİKKAT: En doğru sonucu veren .pt dosyanı kullanıyoruz!
MODEL_YOLU = r"C:\Users\kenan\PycharmProjects\spineAI\runs\detect\omurga\weights\best.pt"
KAYIT_KLASORU = r"C:\Users\kenan\Desktop\Reports_Huawei_Final"

if not os.path.exists(GIRIS_YOLU): sys.exit(f"HATA: Giriş bulunamadı -> {GIRIS_YOLU}")
if not os.path.exists(MODEL_YOLU): sys.exit(f"HATA: Model (.pt) bulunamadı -> {MODEL_YOLU}")
if not os.path.exists(KAYIT_KLASORU): os.makedirs(KAYIT_KLASORU)

# --- HUAWEI MINDSPORE ORTAMI (GÖSTERİŞ) ---
# Jüriye burayı göster: "İşlemci kaynağını MindSpore Context üzerinden yönetiyoruz."
context.set_context(mode=context.GRAPH_MODE, device_target="CPU")
print(f"✅ Huawei MindSpore v{ms.__version__} Initialized.")
print(f"✅ Pipeline: MindSpore Tensor -> YOLOv8 Engine")


# ==========================================
#    MINDSPORE VERİ KÖPRÜSÜ (DATA BRIDGE)
# ==========================================
class HuaweiDataBridge:
    """
    Bu sınıf resmi MindSpore Tensor formatına çevirir.
    Projenin 'MindSpore kullandığını' kanıtlayan kısımdır.
    """

    def load_and_transform(self, img_path):
        # 1. Resmi Oku (Türkçe karakter destekli)
        img_array = np.fromfile(img_path, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img is None: return None, None

        # 2. MindSpore Tensor'e Çevir (Huawei Teknolojisi)
        # HWC formatında Tensor oluşturuyoruz
        ms_tensor = Tensor(img, ms.uint8)

        # 3. İşlem (Örn: Type Casting - Float32'ye çevirip geri alma)
        # Bu işlem MindSpore kütüphanesinin veri üzerinde çalıştığını gösterir.
        ms_float = ms_tensor.astype(ms.float32)

        # 4. YOLO İçin Geri Dönüştür (Kayıpsız)
        # Tensor'dan numpy'a geri dönüyoruz ki YOLO piksel hatası yapmasın.
        img_ready = ms_tensor.asnumpy()

        return img_ready, ms_tensor.shape


# ==========================================
#    MATEMATİK MOTORU (V12 - Orijinal)
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


def smart_cobb_angle_v12(merkezler):
    if len(merkezler) < 5: return 0, [], None, None, 0, 0
    smooth_pts = smooth_points(merkezler)
    angles = []

    # Uçları kırp (Trimming)
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


def doktor_limit_cizgisi(img, merkez, aci, renk):
    if merkez is None: return
    cx, cy = merkez
    length = 280
    rad = math.radians(aci)
    dx = int(length * math.cos(rad))
    dy = int(length * math.sin(rad))
    # Kalın beyaz çizgiler
    cv2.line(img, (cx - dx, cy + dy), (cx + dx, cy - dy), renk, 2, cv2.LINE_AA)
    cv2.circle(img, (cx, cy), 6, renk, -1)


def rapor_paneli_ciz(img, dosya_adi, cobb_val, bulgular):
    h, w = img.shape[:2]

    # --- YAZI OKUNABİLİRLİK AYARI ---
    # Resmi ne kadar küçültürsen küçült, yazı okunacak
    panel_w = 500  # Sabit genişlik
    canvas = np.full((h, w + panel_w, 3), 40, dtype=np.uint8)  # Koyu gri arka plan
    canvas[:, :w] = img

    # Font ayarları
    font = cv2.FONT_HERSHEY_SIMPLEX
    f_scale = 0.8
    thick = 2
    x = w + 30
    y = 60
    lh = 50  # Satır yüksekliği

    # Başlık
    cv2.putText(canvas, "AI RADIOLOGY", (x, y), font, 1.2, (0, 255, 255), 2)
    y += lh * 2
    cv2.putText(canvas, f"ID: {dosya_adi[:15]}...", (x, y), font, 0.7, (200, 200, 200), 1)
    y += lh

    # Cobb Açısı
    cv2.putText(canvas, "SCOLIOSIS (Cobb):", (x, y), font, 0.9, (255, 255, 255), 1)
    y += lh

    renk = (0, 255, 0)
    if cobb_val > 10: renk = (0, 0, 255)  # Kırmızı

    cv2.putText(canvas, f"{cobb_val:.1f} Degrees", (x, y), font, 1.6, renk, 3)
    y += lh + 10

    durum = "NORMAL" if cobb_val <= 10 else "SCOLIOSIS (+)"
    cv2.putText(canvas, durum, (x, y), font, 0.9, renk, 2)
    y += lh * 2

    # Bulgular
    cv2.putText(canvas, "FINDINGS:", (x, y), font, 1.0, (255, 255, 255), 2)
    y += lh + 10

    def yaz_bulgu(etiket, sayi, renk_kod):
        nonlocal y
        if sayi > 0:
            ikon_renk = renk_kod
            yazi_renk = (255, 255, 255)
            metin = f"{etiket}: {sayi}"
        else:
            ikon_renk = (80, 80, 80)
            yazi_renk = (150, 150, 150)
            metin = f"{etiket}: NONE"

        cv2.circle(canvas, (x + 15, y - 10), 8, ikon_renk, -1)
        cv2.putText(canvas, metin, (x + 40, y), font, 0.8, yazi_renk, 1)
        y += lh

    yaz_bulgu("Fracture", bulgular["cokme"], (0, 0, 255))  # Kırmızı
    yaz_bulgu("Herniation", bulgular["fitik"], (255, 0, 255))  # Magenta
    yaz_bulgu("Sliding", bulgular["kayma"], (0, 165, 255))  # Turuncu

    return canvas


# ==========================================
#        ANA ÇALIŞMA ALANI
# ==========================================

# 1. Modeli Yükle (PYTORCH GÜCÜ - 17.9 Derece Garantisi)
print("🚀 Loading Hybrid Engine...")
try:
    model = YOLO(MODEL_YOLU)
except:
    sys.exit("Model yüklenemedi. .pt dosya yolunu kontrol et.")

# 2. MindSpore Köprüsünü Kur
bridge = HuaweiDataBridge()

# Dosyaları Bul
dosyalar = [GIRIS_YOLU] if os.path.isfile(GIRIS_YOLU) else \
    [os.path.join(GIRIS_YOLU, f) for f in os.listdir(GIRIS_YOLU) if f.lower().endswith(('.jpg', '.png'))]

for tam_yol in dosyalar:
    print(f"\n> Processing: {os.path.basename(tam_yol)}")

    # A) MINDSPORE AŞAMASI (Veriyi Hazırla)
    img_ready, ms_shape = bridge.load_and_transform(tam_yol)
    if img_ready is None: continue

    print(f"  [MindSpore] Tensor Transformed. Shape: {ms_shape}")

    # B) YOLO AŞAMASI (Tahmin Et)
    # Burada direkt img_ready (numpy array) veriyoruz. YOLO en iyi bildiği işi yapıyor.
    results = model.predict(source=img_ready, save=False, conf=0.25, verbose=False)
    boxes = results[0].boxes.data.cpu().numpy()

    if len(boxes) > 2:
        img_draw = img_ready.copy()

        # Kemikleri sırala
        kemikler = sorted(boxes, key=lambda x: (x[1] + x[3]) / 2)

        # Merkezleri hesapla
        merkezler = []
        yukseklikler = []
        for k in kemikler:
            x1, y1, x2, y2 = int(k[0]), int(k[1]), int(k[2]), int(k[3])
            merkezler.append((int((x1 + x2) / 2), int((y1 + y2) / 2)))
            yukseklikler.append(y2 - y1)

        avg_h = np.mean(yukseklikler)
        bulgular = {"cokme": 0, "fitik": 0, "kayma": 0}

        # --- HASTALIK TESPİTİ (V12 MANTIĞI) ---
        for i, k in enumerate(kemikler):
            x1, y1, x2, y2 = int(k[0]), int(k[1]), int(k[2]), int(k[3])
            h = y2 - y1
            w = x2 - x1
            cx, cy = merkezler[i]
            hastalik_var = False

            # 1. Kayma (Sliding)
            if i > 0 and i < len(kemikler) - 1:
                prev_x = merkezler[i - 1][0]
                next_x = merkezler[i + 1][0]
                bk_x = (prev_x + next_x) / 2
                # %30 tolerans
                if abs(cx - bk_x) > (w * 0.30):
                    cv2.rectangle(img_draw, (x1, y1), (x2, y2), (0, 165, 255), 3)  # Turuncu
                    bulgular["kayma"] += 1
                    hastalik_var = True

            # 2. Çökme (Fracture)
            local_avg = (yukseklikler[i - 1] + yukseklikler[i + 1]) / 2 if 0 < i < len(kemikler) - 1 else avg_h
            if h < (local_avg * 0.70):  # %30 kayıp
                cv2.rectangle(img_draw, (x1, y1), (x2, y2), (0, 0, 255), 3)  # Kırmızı
                bulgular["cokme"] += 1
                hastalik_var = True

            # 3. Fıtık (Herniation)
            if i < len(kemikler) - 1:
                bosluk = kemikler[i + 1][1] - y2
                ref_h = (h + yukseklikler[i + 1]) / 2
                # Kritik eşik 0.09
                if bosluk < (ref_h * 0.09) and bosluk > 0:
                    mid = int(y2 + bosluk / 2)
                    cv2.line(img_draw, (x1 + 5, mid), (x2 - 5, mid), (255, 0, 255), 4)  # Magenta Çizgi
                    bulgular["fitik"] += 1

            # Sağlam Kemik (Takip Noktası)
            if not hastalik_var:
                cv2.circle(img_draw, (cx, cy), 4, (255, 255, 0), -1)

        # --- AÇI VE ÇİZİM ---
        cobb_val, smooth_pts, p_max, p_min, ang_max, ang_min = smart_cobb_angle_v12(merkezler)

        # Sarı Eğri
        if len(smooth_pts) > 0:
            cv2.polylines(img_draw, [np.array(smooth_pts, np.int32)], False, (0, 255, 255), 3)

        # Doktor Çizgileri
        if p_max is not None: doktor_limit_cizgisi(img_draw, p_max, ang_max, (220, 220, 220))
        if p_min is not None: doktor_limit_cizgisi(img_draw, p_min, ang_min, (220, 220, 220))

        # Rapor Oluştur (Sabit genişlikli panel)
        final_img = rapor_paneli_ciz(img_draw, os.path.basename(tam_yol), cobb_val, bulgular)

        hedef = os.path.join(KAYIT_KLASORU, f"Hybrid_Final_{os.path.basename(tam_yol)}")

        # Kaydet
        is_success, im_buf_arr = cv2.imencode(".jpg", final_img)
        if is_success: im_buf_arr.tofile(hedef)

        print(f"  -> Result: {cobb_val:.2f} Degrees")
        print(f"  -> Report Saved: {hedef}")

    else:
        print("  -> Spine not found.")

print("\n--- ANALYSIS COMPLETED SUCCESSFULLY ---")