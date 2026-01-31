from ultralytics import YOLO
import multiprocessing

if __name__ == '__main__':
    multiprocessing.freeze_support()

    print("Model hazırlanıyor...")

    # Sıfır kilometre model ile başlıyoruz (Veri seti birleştiği için en doğrusu budur)
    model = YOLO("yolov8n.pt")

    # Eğitimi başlat
    model.train(
        data="Spine Region/data.yaml", # Birleştirdiğin klasörün yaml dosyası
        epochs=100,     # Veri arttığı için 100 tur (epoch) idealdir
        imgsz=640,
        batch=8,
        device=0,       # RTX 4060
        workers=4
    )