# 🎯 Start Analysis - Hızlı Referans

## ⚡ 3 Adımda Başla

### 1. Python Kur
```powershell
powershell -ExecutionPolicy Bypass -File install_python.ps1
```

### 2. Modeli Yerleştir
```
backend/models/best.pt  ← Eğitilmiş modelinizi buraya kopyalayın
```

### 3. Başlat
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🧪 Test Et

1. **Giriş:** `http://localhost:5173`
2. **Dashboard'a git**
3. **Görüntü yükle** (JPEG/PNG)
4. **Start Analysis** tıkla
5. **Sonuçları gör** (10-30 saniye)

## 📊 Tespit Edilen Hastalıklar

| Hastalık | Açıklama | Şiddet |
|----------|----------|--------|
| **Compression Fracture** | Omur ezilmesi | 🔴 Critical |
| **Herniated Disc** | Disk fıtığı | 🟡 Moderate |
| **Listhesis** | Omur kayması | 🟡 Moderate |
| **Scoliosis** | Omurga eğriliği (> 10°) | 🟡 Moderate |
| **Lordosis** | Anormal lordoz (< 20° veya > 60°) | 🟡 Moderate |

## 🔍 Sonuç Formatı

```json
{
  "success": true,
  "imageType": "LATERAL",      // AP veya LATERAL
  "cobbAngle": 35.2,           // Omurga açısı (derece)
  "vertebraeCount": 12,        // Tespit edilen omur sayısı
  "findings": {
    "compression_fracture": 0, // Kompresyon kırığı sayısı
    "herniated_disc": 1,       // Fıtık sayısı
    "listhesis": 0             // Kayma sayısı
  },
  "severity": "moderate",      // normal, moderate, critical
  "consultDoctor": true,       // Doktora başvuru gerekli mi?
  "recommendations": [
    "⚠️ Disk hernisi tespit edildi..."
  ],
  "score": 80                  // Sağlık skoru (0-100)
}
```

## ⚠️ Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| ❌ Model bulunamadı | `best.pt` dosyasını `backend/models/` klasörüne kopyala |
| ❌ Python bulunamadı | Python'u PATH'e ekle veya `python3` kullan |
| ❌ Paket eksik | `pip install -r requirements.txt` |
| ❌ CUDA hatası | CPU modu: `pip install torch --index-url https://download.pytorch.org/whl/cpu` |
| 🧪 Mock kullanılıyor | Model dosyası eksik, yerleştir |

## 📝 Dosya Konumları

```
backend/
  ├── spine_analysis.py          # Ana Python scripti
  ├── test_environment.py        # Test scripti
  ├── requirements.txt           # Python paketleri
  ├── models/
  │   └── best.pt               # 🤖 Modeliniz buraya!
  ├── uploads/                   # Yüklenen görüntüler
  └── src/
      └── services/
          └── pythonAnalysisService.js
```

## 🎯 Test Checklist

- [ ] Python 3.8+ kurulu
- [ ] Paketler yüklü (`pip install -r requirements.txt`)
- [ ] `test_environment.py` başarılı ✅
- [ ] Model dosyası yerinde (`models/best.pt`)
- [ ] Backend çalışıyor (port 5000)
- [ ] Frontend çalışıyor (port 5173)
- [ ] Giriş yapabiliyorum
- [ ] Görüntü yükleyebiliyorum
- [ ] Start Analysis çalışıyor
- [ ] Sonuçlar görünüyor

## 🔗 Linkler

- 📖 [Detaylı Kurulum](START_ANALYSIS_SETUP.md)
- 🐍 [Python Rehberi](backend/PYTHON_SETUP.md)
- ✅ [Tamamlanan İşler](START_ANALYSIS_COMPLETED.md)

## 💡 İpuçları

- **Görüntü Formatları:** JPEG, JPG, PNG
- **Maksimum Boyut:** 10MB
- **Analiz Süresi:** 10-30 saniye
- **Gereken Omur:** Minimum 3 vertebra
- **Görüntü Tipleri:** AP (ön-arka) veya LATERAL (yan)

## 🆘 Yardım

Sorun yaşıyorsanız:
1. `test_environment.py` çalıştır
2. Backend terminal loglarını kontrol et
3. Browser console'u kontrol et (F12)
4. Model dosyasını doğrula

---

**Son Güncelleme:** 27 Ocak 2026  
**Versiyon:** 1.0.0
