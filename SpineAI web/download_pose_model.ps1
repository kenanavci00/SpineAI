# Download YOLO Pose Model for Posture Analysis

Write-Host "📥 Downloading YOLO Pose Model..." -ForegroundColor Cyan
Write-Host ""

$modelUrl = "https://github.com/ultralytics/assets/releases/download/v8.0.0/yolov8n-pose.pt"
$outputPath = Join-Path $PSScriptRoot "backend\yolov8n-pose.pt"

if (Test-Path $outputPath) {
    Write-Host "✅ Model already exists: $outputPath" -ForegroundColor Green
    Write-Host "   Skipping download." -ForegroundColor Gray
    exit 0
}

try {
    Write-Host "🌐 URL: $modelUrl" -ForegroundColor Gray
    Write-Host "📁 Destination: $outputPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⏳ Downloading... (This may take a few minutes)" -ForegroundColor Yellow
    
    # Download using Invoke-WebRequest
    Invoke-WebRequest -Uri $modelUrl -OutFile $outputPath -UseBasicParsing
    
    if (Test-Path $outputPath) {
        $fileSize = (Get-Item $outputPath).Length / 1MB
        Write-Host ""
        Write-Host "✅ Download complete!" -ForegroundColor Green
        Write-Host "   Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        Write-Host "   Location: $outputPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Posture analysis model ready!" -ForegroundColor Cyan
    } else {
        throw "File not created"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Manual Download:" -ForegroundColor Yellow
    Write-Host "   1. Visit: https://github.com/ultralytics/ultralytics" -ForegroundColor White
    Write-Host "   2. Download: yolov8n-pose.pt" -ForegroundColor White
    Write-Host "   3. Place in: backend\" -ForegroundColor White
    Write-Host ""
    exit 1
}
