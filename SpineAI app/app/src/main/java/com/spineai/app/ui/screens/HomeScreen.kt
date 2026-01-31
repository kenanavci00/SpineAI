package com.spineai.app.ui.screens

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.spineai.app.viewmodel.SpineViewModel
import kotlin.math.sqrt
import kotlin.random.Random

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: SpineViewModel,
    onNavigateToAnalysis: () -> Unit
) {
    val context = LocalContext.current
    var showSheet by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()
    
    // --- Image Pickers ---
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            viewModel.analyzeImage(context, bitmap)
            showSheet = false
            onNavigateToAnalysis()
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            val bitmap = com.spineai.app.utils.ImageUtils.loadBitmapFromUri(context, uri)
            if (bitmap != null) {
                viewModel.analyzeImage(context, bitmap)
                showSheet = false
                onNavigateToAnalysis()
            }
        }
    }

    // --- Procedural Constellation Data ---
    val points = remember {
        List(60) { Offset(Random.nextFloat(), Random.nextFloat()) }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF040913), Color(0xFF000000))
                )
            )
    ) {
        // 1. Constellation Effect
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            
            // Draw Lines
            for (i in points.indices) {
                for (j in i + 1 until points.size) {
                    val p1 = points[i]
                    val p2 = points[j]
                    val dist = sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
                    
                    if (dist < 0.15f) {
                         val alpha = (1f - (dist / 0.15f)) * 0.2f
                         drawLine(
                             color = Color(0xFF00E5FF).copy(alpha = alpha), // Neon Cyan
                             start = Offset(p1.x * w, p1.y * h),
                             end = Offset(p2.x * w, p2.y * h),
                             strokeWidth = 1.dp.toPx(),
                             cap = StrokeCap.Round
                         )
                    }
                }
            }
            // Draw Points
            points.forEach { p ->
                drawCircle(
                    color = Color(0xFF00E5FF).copy(alpha = 0.6f),
                    center = Offset(p.x * w, p.y * h),
                    radius = Random.nextFloat() * 2f + 1f
                )
            }
        }

        // 2. Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .systemBarsPadding()
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "Sensitive Spine Analysis\nPowered by AI",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Advanced medical analysis for spinal health.",
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFFA0AEC0) // Cool Gray
            )

            Spacer(modifier = Modifier.height(48.dp))

            // Quick Guide Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0x22FFFFFF) // Glass effect
                ),
                shape = MaterialTheme.shapes.large
            ) {
                Row(
                    modifier = Modifier.padding(24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.PhoneAndroid,
                        contentDescription = null,
                        tint = Color(0xFF00E5FF),
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = "Quick Guide",
                            color = Color(0xFF00E5FF), // Neon Cyan
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Keep phone steady and ensure the spine is centered.",
                            color = Color.White.copy(alpha = 0.9f),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }

        // 3. CTA Button (Bottom Center)
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp, start = 24.dp, end = 24.dp)
                .fillMaxWidth()
        ) {
            Button(
                onClick = { showSheet = true },
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .height(56.dp)
                    .align(Alignment.Center),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF00E5FF) // Neon Cyan
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CameraAlt, 
                    contentDescription = null,
                    tint = Color.Black
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "START ANALYSIS",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }

        // 4. Modal Bottom Sheet
        if (showSheet) {
            ModalBottomSheet(
                onDismissRequest = { showSheet = false },
                sheetState = sheetState,
                containerColor = Color(0xFF1A202C)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    Text(
                        text = "Choose Image Source",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(24.dp))

                    // Option 1: Camera
                    Surface(
                        onClick = { cameraLauncher.launch(null) },
                        color = Color.Transparent,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = Color(0xFF00E5FF),
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Text("Take New Photo", color = Color.White, fontSize = 18.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Option 2: Gallery
                    Surface(
                        onClick = { 
                            galleryLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                            ) 
                        },
                        color = Color.Transparent,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Image,
                                contentDescription = null,
                                tint = Color(0xFF00E5FF),
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Text("Select from Gallery", color = Color.White, fontSize = 18.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(48.dp))
                }
            }
        }
    }
}
