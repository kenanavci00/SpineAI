package com.spineai.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Bed
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdviceScreen(onBack: () -> Unit) {
    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF040913), Color(0xFF000000))
    )
    
    val adviceList = listOf(
        AdviceItem("Daily Exercise", "Perform stretching exercises for 15 mins every morning.", Icons.Default.FitnessCenter),
        AdviceItem("Posture Check", "Ensure your workstation is ergonomic. Keep monitor at eye level.", Icons.Default.AccessibilityNew),
        AdviceItem("Rest & Sleep", "Use a medium-firm mattress and avoid high pillows.", Icons.Default.Bed),
        AdviceItem("Mindfulness", "Practice deep breathing to reduce muscle tension.", Icons.Default.SelfImprovement)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        "Personalized Recovery Plan", 
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        },
        containerColor = Color.Transparent // Handled by Box
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(bgGradient)
                .padding(padding)
        ) {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                     Text(
                        text = "Rx: Recommendations",
                        color = Color(0xFF00E5FF),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }
                
                items(adviceList) { advice ->
                    AdviceCard(advice)
                }
                
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        text = "Disclaimer: This is AI-generated advice. Please consult a specialist for diagnosis.",
                        color = Color.Gray,
                        fontSize = 12.sp,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }
            }
        }
    }
}

data class AdviceItem(val title: String, val desc: String, val icon: ImageVector)

@Composable
fun AdviceCard(advice: AdviceItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0x1AFFFFFF)), // Very subtle transparent white
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = Color(0xFF00E5FF).copy(alpha = 0.1f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = advice.icon,
                        contentDescription = null,
                        tint = Color(0xFF00E5FF)
                    )
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = advice.title,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = advice.desc,
                    color = Color(0xFFA0AEC0),
                    fontSize = 14.sp
                )
            }
        }
    }
}
