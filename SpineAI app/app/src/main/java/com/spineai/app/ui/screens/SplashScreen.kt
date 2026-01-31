package com.spineai.app.ui.screens

import android.view.animation.OvershootInterpolator
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.spineai.app.R
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onSplashComplete: () -> Unit) {
    val scale = remember { Animatable(0f) }

    // Animation Effect: Scale up with bounce (Sephora-ish zoom effect)
    LaunchedEffect(key1 = true) {
        scale.animateTo(
            targetValue = 1.2f, // Zoom in slightly larger than normal
            animationSpec = tween(
                durationMillis = 800,
                easing = {
                    OvershootInterpolator(2f).getInterpolation(it)
                }
            )
        )
        delay(500) // Hold
        onSplashComplete()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF040913), Color(0xFF000000))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.app_logo),
            contentDescription = "SpineAI Logo",
            modifier = Modifier
                .size(200.dp)
                .scale(scale.value)
        )
    }
}
