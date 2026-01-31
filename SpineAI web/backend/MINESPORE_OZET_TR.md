# Minespore Entegrasyonu - Özet Rapor

## 📋 Oluşturulan Dosyalar

### 1. **posture_analysis_minespore.py**
- **Amaç**: Minespore framework'ü ile postür analizi
- **Kullanılan Model**: `best postur.onnx`
- **Özellikler**:
  - İleri/geri baş postürü tespiti
  - Kifoz (kamburluk) tespiti
  - 17 vücut kilit noktası (keypoint) tespiti
  - Boyun ve gövde açıları hesaplama
  - Detaylı öneriler

### 2. **spine_analysis_minespore.py**
- **Amaç**: Minespore framework'ü ile omurga hastalığı tespiti
- **Kullanılan Model**: `best.onnx` veya `best postur.onnx`
- **Özellikler**:
  - Kompresyon kırığı tespiti
  - Disk hernisi tespiti
  - Listhesis (omur kayması) tespiti
  - Cobb açısı hesaplama (skolyoz için)
  - Röntgen tipi sınıflandırma (AP/LATERAL)

### 3. **requirements_minespore.txt**
- Minespore ve gerekli tüm kütüphanelerin listesi
- Kurulum için: `pip install -r requirements_minespore.txt`

### 4. **test_minespore.py**
- Test scripti - kurulumun doğru çalışıp çalışmadığını kontrol eder
- Çalıştırma: `python test_minespore.py`

### 5. **MINESPORE_INTEGRATION.md**
- Tam dokümantasyon (İngilizce)
- API detayları, kullanım örnekleri, mimari bilgileri

### 6. **MINESPORE_QUICK_SETUP.md**
- Hızlı kurulum kılavuzu
- Entegrasyon seçenekleri
- Sorun giderme rehberi

## 🔧 Minespore Nedir?

**Minespore** (MindSpore olarak da bilinir), Huawei tarafından geliştirilen açık kaynaklı bir derin öğrenme framework'üdür. PyTorch ve TensorFlow'a alternatiftir.

### Avantajları:
- ✅ ONNX model desteği
- ✅ CPU, GPU ve Ascend işlemci desteği
- ✅ Hafif ve hızlı
- ✅ Üretim ortamı için optimize edilmiş

## 📦 Kurulum Adımları

### 1. Minespore Kurulumu
```powershell
pip install mindspore
```

### 2. Diğer Bağımlılıklar
```powershell
cd backend
pip install -r requirements_minespore.txt
```

### 3. Model Dosyalarını Kopyalama
```powershell
# Desktop'taki yeni klasöründen backend'e kopyala
Copy-Item "C:\Users\nisa\Desktop\yeni\best postur.onnx" ".\backend\"
Copy-Item "C:\Users\nisa\Desktop\yeni\best.onnx" ".\backend\"
```

### 4. Test Et
```powershell
cd backend
python test_minespore.py
```

## 🎯 Nasıl Çalışır?

### Eski Sistem (Ultralytics):
```
Görsel → YOLO Model (.pt) → Ultralytics API → Sonuç
```

### Yeni Sistem (Minespore):
```
Görsel → Ön İşleme → ONNX Model → Minespore → Son İşleme → Sonuç
```

## 🔄 Veri İşleme Pipeline'ı

### 1. Ön İşleme (Preprocessing)
```python
# Görsel yükleme
img = cv2.imread(image_path)

# Boyutlandırma (640x640)
img_resized = cv2.resize(img, (640, 640))

# BGR → RGB dönüşümü
img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)

# Normalizasyon [0, 1]
img_normalized = img_rgb.astype(np.float32) / 255.0

# Kanal sıralama değişikliği (H, W, C) → (C, H, W)
img_transposed = np.transpose(img_normalized, (2, 0, 1))

# Batch boyutu ekleme (1, C, H, W)
img_batched = np.expand_dims(img_transposed, axis=0)

# Minespore Tensor'a dönüştürme
tensor_input = Tensor(img_batched, ms.float32)
```

### 2. Model Çıkarımı (Inference)
```python
# Model ile tahmin
output = model(input_tensor)
```

### 3. Son İşleme (Postprocessing)
```python
# Koordinatları orijinal boyuta dönüştürme
x_scaled = x * (orig_width / 640)
y_scaled = y * (orig_height / 640)

# Güven eşiği filtresi
if confidence > threshold:
    # Tespit kabul edilir
```

## 📊 Çıktı Formatı

### Postür Analizi Çıktısı:
```json
{
  "success": true,
  "analysis": {
    "overall": {
      "status": "SAĞLIKLI POSTÜR",
      "severity": "normal",
      "score": 100,
      "consult_doctor": false
    },
    "head": {
      "status": "NORMAL",
      "deviation_cm": 0.0
    },
    "back": {
      "status": "SIRT HİZALI",
      "deviation_cm": 0.0
    },
    "recommendations": [...]
  },
  "metadata": {
    "framework": "Minespore",
    "model": "best postur.onnx"
  }
}
```

## 🔌 Entegrasyon Seçenekleri

### Seçenek 1: Mevcut Sistemi Güncelle
`.env` dosyasına ekle:
```env
USE_MINESPORE=true
```

`pythonAnalysisService.js` dosyasını güncelle:
```javascript
const USE_MINESPORE = process.env.USE_MINESPORE === 'true';

const script = USE_MINESPORE 
  ? 'posture_analysis_minespore.py'
  : 'posture_analysis.py';
```

### Seçenek 2: Ayrı Servis Oluştur
Yeni bir `minesporeAnalysisService.js` dosyası oluştur.

### Seçenek 3: API Parametresi
Frontend'den framework seçimi yap:
```javascript
fetch('/api/analyze', {
  body: {
    framework: 'minespore'  // veya 'ultralytics'
  }
})
```

## ⚡ Performans

| Framework | Model | Hız (CPU) | Doğruluk |
|-----------|-------|-----------|----------|
| Ultralytics | .pt | Hızlı | Yüksek |
| Minespore | .onnx | Orta | Yüksek |
| OpenCV DNN | .onnx | Çok Hızlı | Orta |

## 🛡️ Yedek Sistem (Fallback)

Minespore yüklenemezse veya hata verirse, otomatik olarak **OpenCV DNN** kullanılır:

```python
if self.model is None:
    # OpenCV DNN ile yedek analiz
    return self._analyze_with_opencv_dnn(image_path)
```

## 🧪 Test Senaryoları

Test scripti şunları kontrol eder:
1. ✅ Kütüphaneler kurulu mu?
2. ✅ Analyzer sınıfları başlatılıyor mu?
3. ✅ Ön işleme çalışıyor mu?
4. ✅ Cobb açısı hesaplanıyor mu?
5. ✅ Hastalık tespiti çalışıyor mu?

## 🔍 Teknik Detaylar

### YOLO Pose Keypoints (17 nokta):
```
0: Burun
1-2: Gözler
3-4: Kulaklar
5-6: Omuzlar
7-8: Dirsekler
9-10: Bilekler
11-12: Kalçalar
13-14: Dizler
15-16: Ayak bilekleri
```

### Omurga Analizi Metrikleri:
- **Kompresyon Kırığı**: Omur yüksekliğinde %40+ kayıp
- **Disk Hernisi**: Omurlar arası mesafe çok dar
- **Listhesis**: Omur hizalaması bozuk
- **Cobb Açısı**: Omurga eğriliği (>10° = skolyoz)

## 📖 Dosya Yapısı

```
backend/
├── posture_analysis_minespore.py    # Postür analizi (Minespore)
├── spine_analysis_minespore.py      # Omurga analizi (Minespore)
├── test_minespore.py                # Test scripti
├── requirements_minespore.txt       # Gereksinimler
├── MINESPORE_INTEGRATION.md         # Tam dokümantasyon
├── MINESPORE_QUICK_SETUP.md         # Hızlı kurulum
├── MINESPORE_OZET_TR.md            # Bu dosya
├── best postur.onnx                 # Postür modeli (kopyalanacak)
└── best.onnx                        # Omurga modeli (kopyalanacak)
```

## 🚀 Sonraki Adımlar

1. ✅ **Kurulum**: Minespore ve bağımlılıkları kur
2. ✅ **Model Kopyalama**: ONNX modellerini backend klasörüne kopyala
3. ✅ **Test**: `python test_minespore.py` ile test et
4. ✅ **Entegrasyon**: Yukarıdaki seçeneklerden birini uygula
5. ✅ **Gerçek Test**: Gerçek görsellerle dene
6. ✅ **Üretim**: Canlı sisteme al

## 💡 İpuçları

### Hızı Artırmak İçin:
```python
# Giriş boyutunu küçült
analyzer.input_size = (416, 416)

# GPU kullan (varsa)
context.set_context(device_target="GPU")
```

### Daha Fazla Tespit İçin:
```python
# Güven eşiğini düşür
analyzer.conf_threshold = 0.3
```

### Bellek Kullanımını Azaltmak İçin:
```python
# CPU modunu zorla
context.set_context(device_target="CPU")
```

## ❓ Sık Sorulan Sorular

**S: Minespore zorunlu mu?**
C: Hayır. Sistem otomatik olarak OpenCV DNN'e geçer.

**S: Eski YOLO modelleri çalışmaya devam eder mi?**
C: Evet. İki sistem paralel çalışabilir.

**S: ONNX modeli nereden geliyor?**
C: Desktop\yeni klasöründeki "best postur.onnx" dosyası.

**S: Performans farkı var mı?**
C: Minespore biraz daha yavaş ama daha kontrollü.

**S: GPU gerekli mi?**
C: Hayır. CPU ile de çalışır.

## 📞 Destek

Sorun yaşarsanız:
1. `test_minespore.py` çalıştırın
2. Hata mesajlarını kontrol edin
3. `MINESPORE_INTEGRATION.md` dosyasına bakın
4. Model dosyalarının varlığını kontrol edin

## 🎓 Kaynaklar

- Minespore: https://www.mindspore.cn/en
- ONNX: https://onnx.ai/
- YOLOv8: https://docs.ultralytics.com/

---

**Hazırlayan**: GitHub Copilot  
**Tarih**: 30 Ocak 2026  
**Versiyon**: 1.0
