# Spine AI - Analysis System Backend

## 🚀 Kurulum

### 1. Backend Kurulum

```bash
cd backend
npm install
```

### 2. Python Bağımlılıkları

Python 3.8+ gereklidir. Aşağıdaki paketleri yükleyin:

```bash
pip install ultralytics opencv-python numpy
```

### 3. YOLO Model Dosyası

- YOLO model dosyanızı (`best.pt`) `backend/models/` klasörüne koyun
- Model dosyası yoksa, eğitilmiş bir YOLOv8 omurga tespit modeli gereklidir

### 4. Ortam Değişkenleri

`backend/.env` dosyası oluşturun:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spineai
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
NODE_ENV=development
```

### 5. MongoDB

MongoDB'nin çalıştığından emin olun:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 6. Backend Başlatma

```bash
cd backend
npm run dev
```

Server `http://localhost:5000` adresinde çalışacak.

---

## 🖥️ Frontend Kurulum

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacak.

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `GET /api/auth/me` - Kullanıcı bilgileri

### Analysis
- `POST /api/analyses` - Yeni analiz (multipart/form-data, field: "image")
- `GET /api/analyses` - Kullanıcının analizleri (pagination: ?page=1&limit=10)
- `GET /api/analyses/stats` - Analiz istatistikleri
- `GET /api/analyses/:id` - Tekil analiz detayı
- `DELETE /api/analyses/:id` - Analiz silme

---

## 🔬 Analiz Süreci

1. **Görüntü Yükleme**: Kullanıcı röntgen görüntüsü yükler (JPEG/PNG, max 10MB)
2. **Python Analizi**: YOLO modeli ile omurga segmentasyonu
3. **Hastalık Tespiti**:
   - ✅ Çökme Kırığı (Compression Fracture)
   - ✅ Disk Hernisi (Herniated Disc)
   - ✅ Vertebral Kayma (Listhesis)
   - ✅ Skolyoz (Scoliosis) - Cobb açısı
   - ✅ Lordoz/Kifoz anormallikleri
4. **Sonuç Raporlama**: JSON formatında detaylı rapor

---

## 📊 Analiz Çıktısı

```json
{
  "success": true,
  "message": "Analiz tamamlandı. DOKTORA DANIŞINIZ!",
  "data": {
    "analysisId": "...",
    "result": "Poor",
    "score": 45,
    "cobbAngle": 23.5,
    "imageType": "AP",
    "vertebraeCount": 12,
    "findings": {
      "compression_fracture": 1,
      "herniated_disc": 2,
      "listhesis": 0
    },
    "issues": ["Compression Fracture", "Herniated Disc", "Scoliosis"],
    "recommendations": [
      "Acil ortopedi konsültasyonu önerilir",
      "Disk hernisi tespit edildi - Doktor muayenesi gereklidir"
    ],
    "consultDoctor": true,
    "severity": "critical"
  }
}
```

---

## 🛡️ Güvenlik

- JWT token tabanlı kimlik doğrulama
- Bcrypt ile şifreli parola saklama
- Multer ile güvenli dosya yükleme
- Dosya boyutu ve format validasyonu
- MongoDB injection koruması

---

## 📁 Klasör Yapısı

```
backend/
├── src/
│   ├── config/          # Yapılandırma
│   ├── controllers/     # İş mantığı
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # MongoDB şemaları
│   ├── routes/          # API route'ları
│   ├── services/        # Python entegrasyonu
│   └── server.js        # Ana server
├── uploads/             # Yüklenen görüntüler
├── analysis_results/    # Analiz sonuçları
├── models/              # YOLO model dosyası (best.pt)
└── package.json
```

---

## 🐛 Sorun Giderme

### Python Bulunamıyor
- Python'un PATH'e eklendiğinden emin olun
- Terminal/CMD'de `python --version` çalıştığını doğrulayın

### Model Yüklenemiyor
- `backend/models/best.pt` dosyasının var olduğundan emin olun
- Dosya yolunun doğru olduğunu kontrol edin

### MongoDB Bağlantı Hatası
- MongoDB servisinin çalıştığını kontrol edin
- `.env` dosyasındaki `MONGODB_URI` değerini kontrol edin

### Port Çakışması
- `.env` dosyasında farklı bir PORT belirleyin
- Başka bir uygulama 5000 portunu kullanıyor olabilir

---

## 📝 Notlar

- İlk kullanımda MongoDB'de `spineai` veritabanı otomatik oluşturulur
- Analizler kullanıcı bazlı saklanır
- Görüntüler sunucuda `uploads/` klasöründe tutulur
- Python scriptleri geçici olarak oluşturulup analiz sonrası silinir

---

## 🎯 Özellikler

✅ JWT Authentication (Access + Refresh Token)  
✅ Güvenli dosya yükleme (Multer)  
✅ Python YOLO entegrasyonu  
✅ Real-time analiz  
✅ Hastalık tespiti ve sınıflandırma  
✅ "Doktora Danışın" uyarı sistemi  
✅ Analiz geçmişi ve istatistikler  
✅ MongoDB ile veri saklama  
✅ Responsive frontend (React + Tailwind)  

---

## 👨‍💻 Geliştirici

SpineAI Backend System v1.0  
Advanced Medical Image Analysis Platform
