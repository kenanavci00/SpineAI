from ultralytics import YOLO
import multiprocessing

if __name__ == '__main__':
    multiprocessing.freeze_support()

    print("Model hazırlanıyor...")

    model = YOLO("yolov8n.pt")

    model.train(
        data="Spine Region/data.yaml", 
        epochs=100,     
        imgsz=640,
        batch=8,
        device=0,       
        workers=4
    )
