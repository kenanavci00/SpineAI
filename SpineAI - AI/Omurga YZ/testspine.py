from ultralytics import YOLO
import multiprocessing


if __name__ == '__main__':
    multiprocessing.freeze_support()

    model = YOLO("runs/detect/omurga/weights/best.pt")

    print("--- İŞLEM 1: GÖRSEL TAHMİNLER (Zaten yapıldı ama tekrar yapıyor) ---")

    model.predict(source="Spine Region/test/images", save=True, conf=0.25)

    print("\n" + "=" * 40 + "\n")

    print("--- İŞLEM 2: BAŞARI PUANI (KARNE) HESAPLANIYOR ---")

    metrics = model.val(data="Spine Region/data.yaml", split='test')

    print("\n" + "=" * 40 + "\n")
    print(f"GENEL BAŞARI (mAP50): {metrics.box.map50:.3f}")
    print(f"KESİNLİK (Precision): {metrics.box.mp:.3f}")
    print(f"BULMA (Recall): {metrics.box.mr:.3f}")