package com.spineai.app.viewmodel

import android.content.Context
import android.graphics.Bitmap
import android.graphics.RectF
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.spineai.app.utils.OnnxHelper
import com.spineai.app.utils.SpineAnalysisEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// Simple state to track analysis progress
sealed class AnalysisState {
    object Idle : AnalysisState()
    object Analyzing : AnalysisState()
    data class Completed(
        val riskLevel: RiskLevel, 
        val details: String, 
        val cobbAngle: Float,
        val findings: Map<String, Int>
    ) : AnalysisState()
    data class Error(val message: String) : AnalysisState()
}

enum class RiskLevel {
    LOW, MEDIUM, HIGH
}

class SpineViewModel : ViewModel() {

    private val _analysisState = MutableStateFlow<AnalysisState>(AnalysisState.Idle)
    val analysisState: StateFlow<AnalysisState> = _analysisState.asStateFlow()
    
    // Hold the last analyzed image for display
    var analyzedImage: Bitmap? = null
        private set

    fun analyzeImage(context: Context, bitmap: Bitmap) {
        analyzedImage = bitmap // Cache image
        viewModelScope.launch {
            _analysisState.value = AnalysisState.Analyzing
            
            try {
                withContext(Dispatchers.IO) {
                    // 1. Initialize ONNX
                    OnnxHelper.initialize(context)

                    // 2. Run Inference
                    val boxes = OnnxHelper.detectSpine(bitmap)

                    if (boxes.isEmpty()) {
                         withContext(Dispatchers.Main) {
                            _analysisState.value = AnalysisState.Error("No spine detected. Please try again with a clear image.")
                         }
                         return@withContext
                    }

                    // 3. Convert to RectF for Engine
                    val rects = boxes.map { RectF(it.x1, it.y1, it.x2, it.y2) }

                    // 4. Analyze Logic (Cobb Angle, etc.)
                    val report = SpineAnalysisEngine.analyzeSpine(rects)

                    delay(500) // Small UX delay

                    val risk = when(report.riskLevel) {
                        "HIGH" -> RiskLevel.HIGH
                        "MEDIUM" -> RiskLevel.MEDIUM
                        else -> RiskLevel.LOW
                    }

                    val details = "Cobb Angle: %.1f°\nFractures: ${report.findings["fracture"]}\nSliding: ${report.findings["sliding"]}\nHerniation: ${report.findings["herniation"]}".format(report.cobbAngle)
                    
                    withContext(Dispatchers.Main) {
                        _analysisState.value = AnalysisState.Completed(risk, details, report.cobbAngle, report.findings)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _analysisState.value = AnalysisState.Error("Analysis failed: ${e.message}")
            }
        }
    }

    fun startAnalysis() {
        // Kept for backward compatibility or simulated flow if needed
        viewModelScope.launch {
            _analysisState.value = AnalysisState.Analyzing
            delay(2000)
            _analysisState.value = AnalysisState.Completed(
                RiskLevel.LOW, 
                "Simulation Complete", 
                5.0f,
                mapOf("fracture" to 0, "sliding" to 0, "herniation" to 0)
            )
        }
    }

    fun resetAnalysis() {
        _analysisState.value = AnalysisState.Idle
    }
}
