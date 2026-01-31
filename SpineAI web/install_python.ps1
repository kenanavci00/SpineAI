# Omurga Hastalık Tespit Sistemi - Hızlı Kurulum
# Bu script Python ortamını hazırlar

Write-Host "🏥 Omurga Hastalık Tespit Sistemi - Kurulum" -ForegroundColor Cyan
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

# Python kontrolü
Write-Host "1️⃣  Python kontrolü..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python bulunamadı!" -ForegroundColor Red
    Write-Host "   Python 3.8+ yüklemeniz gerekiyor: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Backend klasörüne git
Write-Host "2️⃣  Backend klasörüne geçiliyor..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "   ✅ Backend klasörü: $backendPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend klasörü bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Python paketlerini yükle
Write-Host "3️⃣  Python paketleri yükleniyor..." -ForegroundColor Yellow
Write-Host "   Bu işlem birkaç dakika sürebilir..." -ForegroundColor Gray

$requirements = @(
    "ultralytics>=8.0.0",
    "opencv-python>=4.8.0",
    "numpy>=1.24.0",
    "torch>=2.0.0"
)

foreach ($package in $requirements) {
    $packageName = $package.Split(">=")[0]
    Write-Host "   📦 Yükleniyor: $packageName..." -ForegroundColor Gray
    python -m pip install $package --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $packageName kuruldu" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $packageName kurulumunda sorun olabilir" -ForegroundColor Yellow
    }
}

Write-Host ""

# Ortamı test et
Write-Host "4️⃣  Python ortamı test ediliyor..." -ForegroundColor Yellow
Write-Host ""
python test_environment.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎉 Kurulum tamamlandı!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Sonraki adımlar:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   1. Eğitilmiş modelinizi buraya kopyalayın:" -ForegroundColor White
    Write-Host "      backend/models/best.pt" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   2. Backend'i başlatın:" -ForegroundColor White
    Write-Host "      cd backend" -ForegroundColor Yellow
    Write-Host "      npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   3. Frontend'i başlatın (yeni terminal):" -ForegroundColor White
    Write-Host "      cd frontend" -ForegroundColor Yellow
    Write-Host "      npm run dev" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Bazı paketler eksik olabilir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Eksik paketleri manuel olarak yükleyin:" -ForegroundColor White
    Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📖 Detaylı bilgi için:" -ForegroundColor Cyan
Write-Host "   START_ANALYSIS_SETUP.md" -ForegroundColor Yellow
Write-Host ""
