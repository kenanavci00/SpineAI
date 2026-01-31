package com.spineai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.spineai.app.ui.screens.*
import com.spineai.app.ui.theme.SpineAITheme
import com.spineai.app.viewmodel.AnalysisState
import com.spineai.app.viewmodel.SpineViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: SpineViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpineAITheme {
                val navController = rememberNavController()
                val analysisState by viewModel.analysisState.collectAsState()

                // State tamamlandığında Sonuç Ekranına (result) yönlendir
                LaunchedEffect(analysisState) {
                    if (analysisState is AnalysisState.Completed) {
                        navController.navigate("result") {
                            popUpTo("analysis") { inclusive = true }
                        }
                    }
                }

                NavHost(navController = navController, startDestination = "splash") {
                    composable("splash") {
                        SplashScreen(
                            onSplashComplete = {
                                navController.navigate("home") {
                                    popUpTo("splash") { inclusive = true }
                                }
                            }
                        )
                    }
                    
                    composable("home") {
                        HomeScreen(
                            viewModel = viewModel,
                            onNavigateToAnalysis = {
                                navController.navigate("analysis")
                            }
                        )
                    }

                    // --- BURASI GÜNCELLENDİ ---
                    // Yeni AnalysisScreen parametrelerine uygun hale getirildi
                    composable("analysis") {
                        AnalysisScreen(
                            analysisState = analysisState,
                            onAnalyzeImage = { bitmap ->
                                // Resmi ViewModel'e gönder
                                viewModel.analyzeImage(applicationContext, bitmap)
                            },
                            onAnalysisComplete = {
                                // Gerekirse buraya ekstra işlem eklenebilir
                                // Navigasyon yukarıdaki LaunchedEffect ile yapılıyor
                            }
                        )
                    }
                    // ---------------------------

                    composable("result") {
                        val state = analysisState
                        if (state is AnalysisState.Completed) {
                            ResultScreen(
                                riskLevel = state.riskLevel,
                                details = state.details,
                                cobbAngle = state.cobbAngle,
                                findings = state.findings,
                                analyzedImage = viewModel.analyzedImage,
                                onSeeAdvice = { navController.navigate("advice") },
                                onRetake = {
                                    viewModel.resetAnalysis()
                                    navController.navigate("home") {
                                        popUpTo("home") { inclusive = true }
                                    }
                                }
                            )
                        } else {
                            // Hata durumunda başa dön
                            viewModel.resetAnalysis()
                            navController.navigate("home")
                        }
                    }
                    composable("advice") {
                        AdviceScreen(
                            onBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}