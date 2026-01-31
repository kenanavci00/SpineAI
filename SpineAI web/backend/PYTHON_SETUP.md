# Omurga Hastalık Tespit Sistemi - Backend

## 🚀 Kurulum ve Çalıştırma

### 1. Python Gereksinimleri

Python 3.8 veya üzeri gereklidir.

```bash
# Python paketlerini yükle
pip install -r requirements.txt
```

Gerekli paketler:
- `ultralytics` - YOLO v8 model çalıştırma
- `opencv-python` - Görüntü işleme
- `numpy` - Matematiksel hesaplamalar
- `torch` - PyTorch (YOLO için gerekli)

### 2. Model Dosyası

Eğitilmiş YOLO modelini `backend/models/best.pt` konumuna yerleştirin.

```
backend/
  models/
    best.pt  <-- Eğitilmiş model buraya
```

### 3. Node.js Backend

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev

# Production modunda çalıştır
npm start
```

### 4. Ortam Değişkenleri

`.env` dosyası oluşturun:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 📋 Python Analiz Scripti

### Kullanım

```bash
python spine_analysis.py <image_path> <model_path>
```

### Örnek

```bash
python spine_analysis.py uploads/xray_image.jpg models/best.pt
```

### Çıktı Formatı

Script JSON formatında sonuç döndürür:

```json
{
  "success": true,
  "imageType": "LATERAL",
  "cobbAngle": 35.2,
  "vertebraeCount": 12,
  "findings": {
    "compression_fracture": 0,
    "herniated_disc": 1,
    "listhesis": 0
  },
  "severity": "moderate",
  "consultDoctor": true,
  "recommendations": [
    "⚠️ Disk hernisi tespit edildi. Doktor muayenesi gereklidir."
  ],
  "score": 80
}
```

## 🔍 Tespit Edilen Hastalıklar

1. **Compression Fracture (Kompresyon Kırığı)**
   - Omur yüksekliğinin %30'dan fazla azalması
   - Şiddet: Critical

2. **Herniated Disc (Disk Hernisi - Fıtık)**
   - Diskler arası mesafenin anormal daralması
   - Şiddet: Moderate

3. **Listhesis (Vertebral Kayma)**
   - Omurların hizadan kayması
   - Şiddet: Moderate

4. **Scoliosis (Skolyoz)**
   - AP görüntülerde Cobb açısı > 10°
   - Şiddet: Moderate

5. **Lordosis Issues (Lordoz Sorunları)**
   - LATERAL görüntülerde anormal eğrilik
   - Düzleşme: < 20° veya Aşırı: > 60°
   - Şiddet: Moderate

## 🧪 Test Etme

Sistemi test etmek için:

1. Backend'i çalıştırın
2. Frontend'i çalıştırın
3. Dashboard'dan bir omurga röntgen görüntüsü yükleyin
4. "Start Analysis" butonuna tıklayın

Konsol loglarını izleyin:
- Node.js backend logları
- Python script çıktısı
- Analiz sonuçları

## ⚠️ Sorun Giderme

### Python bulunamadı hatası

```bash
# Python yolunu kontrol edin
python --version
# veya
python3 --version
```

Windows'ta Python'u PATH'e eklemeyi unutmayın.

### Model bulunamadı hatası

`backend/models/best.pt` dosyasının var olduğundan emin olun.

### Ultralytics hatası

```bash
pip install ultralytics --upgrade
```

### CUDA/GPU hatası

CPU modu için torch'u yeniden yükleyin:

```bash
pip uninstall torch
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

## 📊 API Endpoints

### POST /api/analyses
- Omurga analizi oluşturur
- Requires: Authentication token
- Body: multipart/form-data with 'image' file
- Returns: Analysis results

### GET /api/analyses
- Kullanıcının tüm analizlerini listeler
- Requires: Authentication token
- Query params: page, limit

### GET /api/analyses/:id
- Belirli bir analizi getirir
- Requires: Authentication token

### GET /api/analyses/stats
- Kullanıcı istatistiklerini getirir
- Requires: Authentication token

### DELETE /api/analyses/:id
- Analizi siler
- Requires: Authentication token
