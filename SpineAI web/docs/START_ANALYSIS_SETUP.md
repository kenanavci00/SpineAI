# 🏥 Omurga Hastalık Tespit Sistemi - Start Analysis Kurulum Rehberi

## ✅ Sistem Hazır!

Start Analysis butonu artık eğitilmiş YOLO modelinizi kullanarak çalışacak şekilde yapılandırıldı.

## 📋 Kurulum Adımları

### 1️⃣ Python Paketlerini Yükleyin

```bash
cd backend
pip install -r requirements.txt
```

**Gerekli Paketler:**
- ultralytics (YOLO v8)
- opencv-python (Görüntü işleme)
- numpy (Matematiksel hesaplamalar)
- torch (PyTorch)

### 2️⃣ Python Ortamını Test Edin

```bash
python test_environment.py
```

Bu script şunları kontrol eder:
- ✅ Python versiyonu
- ✅ Gerekli paketler yüklü mü
- ✅ Model dosyası var mı
- ✅ CUDA/GPU desteği (varsa)

### 3️⃣ Model Dosyasını Yerleştirin

Eğitilmiş YOLO modelinizi şu konuma koyun:

```
backend/
  models/
    best.pt  <-- Eğitilmiş modeliniz buraya
```

### 4️⃣ Backend'i Başlatın

```bash
cd backend
npm install
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:5000`

### 5️⃣ Frontend'i Başlatın

Yeni bir terminal açın:

```bash
cd frontend
npm install
npm run dev
```

Frontend şu adreste çalışacak: `http://localhost:5173`

## 🔬 Analiz Nasıl Çalışır?

### Flow:

1. **Kullanıcı** → Dashboard'dan görüntü yükler
2. **Frontend** → `createAnalysis()` fonksiyonunu çağırır
3. **Backend** → Görüntüyü `uploads/` klasörüne kaydeder
4. **Backend** → Python script'ini çalıştırır:
   ```bash
   python spine_analysis.py <image_path> <model_path>
   ```
5. **Python** → YOLO modeli ile görüntüyü analiz eder
6. **Python** → JSON sonuç döndürür
7. **Backend** → Sonucu veritabanına kaydeder
8. **Frontend** → Sonuçları kullanıcıya gösterir

### Python Script Çıktısı:

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

## 🎯 Tespit Edilen Hastalıklar

### 1. **Compression Fracture** (Kompresyon Kırığı)
- Omur yüksekliğinin %30+ azalması
- **Şiddet:** Critical ⚠️

### 2. **Herniated Disc** (Disk Hernisi - Fıtık)
- Diskler arası mesafenin anormal daralması
- **Şiddet:** Moderate ⚠️

### 3. **Listhesis** (Vertebral Kayma)
- Omurların hizadan kayması
- **Şiddet:** Moderate ⚠️

### 4. **Scoliosis** (Skolyoz)
- AP görüntülerde Cobb açısı > 10°
- **Şiddet:** Moderate ⚠️

### 5. **Lordosis Issues** (Lordoz Sorunları)
- LATERAL görüntülerde anormal eğrilik
- Düzleşme (< 20°) veya Aşırı (> 60°)
- **Şiddet:** Moderate ⚠️

## 🧪 Test Etme

1. Backend'i başlatın: `npm run dev` (port 5000)
2. Frontend'i başlatın: `npm run dev` (port 5173)
3. Giriş yapın veya kayıt olun
4. Dashboard → "Upload Image" → Bir omurga röntgeni seçin
5. "Start Analysis" butonuna tıklayın
6. Sonuçları bekleyin (10-30 saniye)

### Konsol Logları:

**Backend Terminal:**
```
🔬 Python analiz başlatılıyor...
📁 Görüntü: uploads/xxxxx.jpg
🤖 Model: models/best.pt
🐍 Script: spine_analysis.py
🐍 Python Output: {"success": true, ...}
✅ Analiz sonuçları: {...}
```

**Browser Console (F12):**
```
🚀 handleStartAnalysis called
📁 Selected file: {...}
🔑 Token: Var
📤 Sending request...
✅ Analysis result: {...}
```

## ⚠️ Sorun Giderme

### ❌ Model bulunamadı hatası

**Sorun:** `Model dosyası bulunamadı: backend/models/best.pt`

**Çözüm:**
```bash
# Model dosyanızı backend/models/ klasörüne kopyalayın
cp your_model_path/best.pt backend/models/best.pt
```

### ❌ Python bulunamadı hatası

**Sorun:** `Python çalıştırma hatası`

**Çözüm:**
```bash
# Python yolunu kontrol edin
python --version
# veya
python3 --version

# Windows'ta Python'u PATH'e ekleyin
# Sistem Ayarları → Gelişmiş → Ortam Değişkenleri
```

### ❌ Ultralytics hatası

**Sorun:** `No module named 'ultralytics'`

**Çözüm:**
```bash
pip install ultralytics
# veya
pip install -r requirements.txt
```

### ❌ CUDA/GPU hatası

**Sorun:** CUDA hatası alıyorsanız

**Çözüm (CPU modu):**
```bash
pip uninstall torch
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### ❌ Görüntü yüklenemiyor

**Sorun:** File upload failed

**Çözüm:**
- Sadece JPEG, JPG, PNG formatları desteklenir
- Maksimum dosya boyutu: 10MB
- `backend/uploads/` klasörü var mı kontrol edin

### ❌ Mock analysis kullanılıyor

**Sorun:** `🧪 Mock analysis kullanılıyor...`

**Çözüm:**
- Model dosyası `backend/models/best.pt` konumunda değil
- Model dosyasını doğru konuma yerleştirin

## 📊 Dosya Yapısı

```
backend/
  ├── spine_analysis.py          # ✨ Ana Python analiz scripti
  ├── test_environment.py        # 🧪 Ortam test scripti
  ├── requirements.txt           # 📦 Python bağımlılıkları
  ├── PYTHON_SETUP.md           # 📖 Detaylı kurulum
  ├── models/
  │   └── best.pt               # 🤖 Eğitilmiş YOLO modeli
  ├── uploads/                  # 📁 Yüklenen görüntüler
  ├── analysis_results/         # 📊 Analiz sonuçları
  └── src/
      ├── server.js
      ├── controllers/
      │   └── analysisController.js
      └── services/
          └── pythonAnalysisService.js  # 🔧 Python entegrasyonu
```

## 🎉 Başarılı Kurulum Kontrolü

Eğer şunları gördüyseniz başarılı:

✅ `test_environment.py` tüm paketleri buldu  
✅ Backend başladı (port 5000)  
✅ Frontend başladı (port 5173)  
✅ Model dosyası yerinde  
✅ Dashboard açılıyor  
✅ Görüntü yüklenebiliyor  
✅ Start Analysis çalışıyor  
✅ Sonuçlar görüntüleniyor  

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. `test_environment.py` çalıştırın
2. Backend ve Frontend terminal loglarını kontrol edin
3. Browser console'u kontrol edin (F12)
4. Model dosyasının varlığını doğrulayın

## 🚀 Sonraki Adımlar

- [ ] Python paketlerini yükle
- [ ] Model dosyasını yerleştir
- [ ] Ortamı test et
- [ ] Backend'i başlat
- [ ] Frontend'i başlat
- [ ] İlk analizi çalıştır

Başarılar! 🎉
