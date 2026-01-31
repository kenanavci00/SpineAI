from ultralytics import YOLO
import os

# --- AYARLAR ---
# Eğittiğin modelin tam yolunu buraya yaz (Eğitim bitince oluşacak yol)
# Genelde şöyledir: runs/detect/train/weights/best.pt
MODEL_YOLU = r"C:\Users\kenan\PycharmProjects\spineAI\Postür Tespiti\yolov8n-pose.pt"


def main():
    # Dosya var mı kontrol et
    if not os.path.exists(MODEL_YOLU):
        print(f"HATA: Model dosyası bulunamadı -> {MODEL_YOLU}")
        print("Lütfen eğitimin bittiğinden ve dosya yolunun doğru olduğundan emin ol.")
        return

    print("1. PyTorch Modeli Yükleniyor...")
    try:
        model = YOLO(MODEL_YOLU)
    except Exception as e:
        print(f"Model yüklenirken hata oluştu: {e}")
        return

    print("2. MindSpore Uyumluluğu İçin ONNX Formatına Dönüştürülüyor...")
    try:
        # export fonksiyonu modeli dönüştürür
        # opset=11, MindSpore ve Ascend işlemcilerle en uyumlu versiyondur
        path = model.export(format="onnx", opset=11)

        print(f"\n✅ BAŞARILI! Modeliniz dönüştürüldü.")
        print(f"📂 Yeni Model Dosyanız: {path}")
        print("👉 Şimdi bu '.onnx' dosyasını MindSpore projesinde kullanabilirsin.")

    except Exception as e:
        print(f"\n❌ Dönüştürme sırasında hata: {e}")


if __name__ == "__main__":
    main()