package com.spineai.app.ui.screens

import android.graphics.Bitmap
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.spineai.app.viewmodel.RiskLevel

@Composable
fun ResultScreen(
    riskLevel: RiskLevel,
    details: String,
    cobbAngle: Float,
    findings: Map<String, Int>,
    analyzedImage: Bitmap?,
    onSeeAdvice: () -> Unit,
    onRetake: () -> Unit
) {
    val isHighRisk = riskLevel == RiskLevel.HIGH
    
    // Theme Colors
    val neonCyan = Color(0xFF00E5FF)
    val highRiskRed = Color(0xFFFF5252)
    val successGreen = Color(0xFF69F0AE)
    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF040913), Color(0xFF000000))
    )

    // Gauge Color Determination
    val gaugeColor = when(riskLevel) {
        RiskLevel.LOW -> successGreen
        RiskLevel.MEDIUM -> Color(0xFFFFAB40) // Orange
        RiskLevel.HIGH -> highRiskRed
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
            .padding(16.dp)
            .padding(top = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 1. Hero Image
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .clip(RoundedCornerShape(16.dp))
                .border(
                    width = if (isHighRisk) 2.dp else 1.dp,
                    color = if (isHighRisk) highRiskRed.copy(alpha=0.6f) else Color.White.copy(alpha=0.1f),
                    shape = RoundedCornerShape(16.dp)
                )
                .background(Color(0xFF1A1A1A)),
            contentAlignment = Alignment.Center
        ) {
            if (analyzedImage != null) {
                Image(
                    bitmap = analyzedImage.asImageBitmap(),
                    contentDescription = "Analyzed Spine",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop // Use Crop or Fit depending on preference
                )
                // Overlay "AI Lines" Placeholder/Effect
                Canvas(modifier = Modifier.fillMaxSize()) {
                    // Draw a subtle overlay grid or effect if desired
                }
            } else {
                Text("Image Processing...", color = Color.Gray)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // 2. The Gauge (Score)
        Box(
            contentAlignment = Alignment.BottomCenter,
            modifier = Modifier.height(140.dp).fillMaxWidth()
        ) {
            Canvas(modifier = Modifier.size(200.dp)) {
                // Background Arc
                drawArc(
                    color = Color.White.copy(alpha = 0.1f),
                    startAngle = 180f,
                    sweepAngle = 180f,
                    useCenter = false,
                    style = Stroke(width = 20.dp.toPx(), cap = StrokeCap.Round)
                )
                
                // Value Arc (based on Cobb Angle, max 60 for visual scale)
                val sweep = (cobbAngle / 60f).coerceIn(0f, 1f) * 180f
                
                drawArc(
                    color = gaugeColor,
                    startAngle = 180f,
                    sweepAngle = sweep,
                    useCenter = false,
                    style = Stroke(width = 20.dp.toPx(), cap = StrokeCap.Round)
                )
            }

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                Text(
                    text = "%.1f°".format(cobbAngle),
                    color = Color.White,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Cobb Angle",
                    color = Color(0xFFA0AEC0),
                    fontSize = 14.sp
                )
            }
        }
        
        // Risk Text
        Text(
            text = when(riskLevel) {
                RiskLevel.LOW -> "LOW RISK"
                RiskLevel.MEDIUM -> "MEDIUM RISK"
                RiskLevel.HIGH -> "HIGH RISK"
            },
            color = gaugeColor,
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp,
            modifier = Modifier.padding(top=8.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 3. Findings Grid
        val findingsList = listOf(
            FindingItem("Fracture", findings["fracture"] ?: 0),
            FindingItem("Sliding", findings["sliding"] ?: 0),
            FindingItem("Herniation", findings["herniation"] ?: 0),
            FindingItem("Scoliosis", if (cobbAngle > 10) 1 else 0)
        )

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(findingsList) { item ->
                FindingCard(item, isHighRisk)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedButton(
                onClick = onRetake,
                modifier = Modifier.weight(1f).height(50.dp),
                border = BorderStroke(1.dp, neonCyan),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = neonCyan)
            ) {
                Text("Retake")
            }
            
            Button(
                onClick = onSeeAdvice,
                modifier = Modifier.weight(1f).height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = neonCyan)
            ) {
                Text("Recovery Plan", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }
    }
}

data class FindingItem(val name: String, val count: Int)

@Composable
fun FindingCard(item: FindingItem, isHighRiskContext: Boolean) {
    val isDetected = item.count > 0
    val cardColor = if (isDetected) Color(0x33FF5252) else Color(0x22FFFFFF)
    val borderColor = if (isDetected) Color(0xFFFF5252) else Color.Transparent

    Card(
        colors = CardDefaults.cardColors(containerColor = cardColor),
        border = if (isDetected) BorderStroke(1.dp, borderColor) else null,
        modifier = Modifier.height(80.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (isDetected) Icons.Default.Warning else Icons.Default.CheckCircle,
                contentDescription = null,
                tint = if (isDetected) Color(0xFFFF5252) else Color(0xFF69F0AE),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = item.name,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                Text(
                    text = if (isDetected) "Detected: ${item.count}" else "Not Detected",
                    color = Color(0xFFA0AEC0),
                    fontSize = 12.sp
                )
            }
        }
    }
}
