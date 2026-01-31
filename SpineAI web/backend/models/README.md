# YOLO Model Dosyası

Bu klasöre eğitilmiş YOLO model dosyanızı (`best.pt`) koyun.

## Model Gereksinimleri

- **Format**: PyTorch (.pt)
- **Model Tipi**: YOLOv8 (Ultralytics)
- **Eğitim**: Omurga/vertebra segmentasyonu için eğitilmiş
- **Minimum Conf**: 0.25

## Model Yoksa

Eğer elinizde eğitilmiş bir model yoksa:

1. YOLOv8 ile kendi veri setinizde eğitim yapın
2. Veya hazır bir omurga tespit modeli edinin
3. Model dosyasını bu klasöre `best.pt` adıyla kaydedin

## Örnek Kullanım

```python
from ultralytics import YOLO

# Model yükleme
model = YOLO('best.pt')

# Tahmin
results = model.predict(source='image.jpg', conf=0.25)
```

---

**Not**: Model dosyası olmadan sistem çalışmayacaktır!
