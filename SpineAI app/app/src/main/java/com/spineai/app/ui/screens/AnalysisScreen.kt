package com.spineai.app.ui.screens

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.spineai.app.viewmodel.AnalysisState

@Composable
fun AnalysisScreen(
    analysisState: AnalysisState, // MainActivity'den gelen state (Gerekirse loading gösterimi için)
    onAnalyzeImage: (Bitmap) -> Unit, // Resmi MainActivity'e geri yollayan fonksiyon
    onAnalysisComplete: () -> Unit // Analiz bittiğinde tetiklenecek
) {
    val context = LocalContext.current

    // Galeri Açıcı (Resim Seçmek İçin)
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            // Load bitmap safely with downsampling to avoid OOM
            val bitmap = com.spineai.app.utils.ImageUtils.loadBitmapFromUri(context, it)
            if (bitmap != null) {
                onAnalyzeImage(bitmap)
            }
        }
    }

    // --- TASARIM KISMI ---

    // Arka plan: Lacivertten siyaha uzay gradyanı
    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(Color(0xFF040913), Color(0xFF000000))
    )
    // Buton: Mavi - Mor gradyan
    val buttonBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFF2563EB), Color(0xFFD946EF))
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundBrush),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(24.dp)
        ) {
            // Başlık
            Text(
                text = "Sensitive Spine\nAnalysis",
                color = Color.White,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                lineHeight = 40.sp
            )
            Text(
                text = "Powered by AI",
                color = Color(0xFF3B82F6),
                fontSize = 20.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(top = 8.dp)
            )

            Spacer(modifier = Modifier.height(60.dp))

            // YÜKLENİYOR İSE (Loading)
            if (analysisState is AnalysisState.Analyzing) {
                CircularProgressIndicator(color = Color(0xFF2563EB))
                Spacer(modifier = Modifier.height(16.dp))
                Text("Analyzing...", color = Color.White)
            }
            else {
                // NORMAL DURUM (Tek Buton)
                Button(
                    onClick = { launcher.launch("image/*") }, // Galeri açılır
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    contentPadding = PaddingValues(),
                    shape = RoundedCornerShape(50)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(buttonBrush, shape = RoundedCornerShape(50)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Start Analysis",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}