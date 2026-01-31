package com.spineai.app.utils

import android.graphics.PointF
import android.graphics.RectF
import kotlin.math.*

data class SpineAnalysisResult(
    val cobbAngle: Float,
    val isScoliosis: Boolean,
    val findings: Map<String, Int>, // "fracture", "herniation", "sliding"
    val riskLevel: String // LOW, MEDIUM, HIGH
)

data class PostureAnalysisResult(
    val headPosture: String, // NORMAL, FORWARD, BACKWARD
    val kyphosisStatus: String, // NORMAL, KYPHOSIS
    val deviationCm: Float,
    val tiltCm: Float,
    val recommendation: String
)

object SpineAnalysisEngine {

    // ==========================================
    //    SPINE ANALYSIS (From omurgamindsporeenglish.py)
    // ==========================================

    fun analyzeSpine(bones: List<RectF>): SpineAnalysisResult {
        if (bones.size < 5) {
            return SpineAnalysisResult(0f, false, emptyMap(), "LOW")
        }

        // 1. Sort bones by Y position (top to bottom)
        val sortedBones = bones.sortedBy { it.centerY() }
        val centers = sortedBones.map { PointF(it.centerX(), it.centerY()) }
        val heights = sortedBones.map { it.height() }

        // 2. Cobb Angle Calculation
        val cobbAngle = calculateSmartCobbAngleV12(centers)

        // 3. Disease Detection
        val findings = mutableMapOf(
            "fracture" to 0,
            "herniation" to 0,
            "sliding" to 0
        )
        val avgHeight = heights.average().toFloat()

        for (i in sortedBones.indices) {
            val bone = sortedBones[i]
            val h = bone.height()
            val w = bone.width()
            val cx = bone.centerX()

            // A. Sliding Detection
            if (i > 0 && i < sortedBones.size - 1) {
                val prevX = sortedBones[i - 1].centerX()
                val nextX = sortedBones[i + 1].centerX()
                val expectedX = (prevX + nextX) / 2
                // 30% tolerance
                if (abs(cx - expectedX) > (w * 0.30f)) {
                    findings["sliding"] = findings.getOrDefault("sliding", 0) + 1
                }
            }

            // B. Fracture Detection (Compression)
            // Use local average of neighbors if possible
            val localAvg = if (i > 0 && i < sortedBones.size - 1) {
                (heights[i - 1] + heights[i + 1]) / 2
            } else {
                avgHeight
            }

            if (h < (localAvg * 0.70f)) { // 30% loss
                findings["fracture"] = findings.getOrDefault("fracture", 0) + 1
            }

            // C. Herniation Detection
            if (i < sortedBones.size - 1) {
                val nextBone = sortedBones[i + 1]
                val gap = nextBone.top - bone.bottom
                val refH = (h + nextBone.height()) / 2

                // Critical threshold 0.09
                if (gap < (refH * 0.09f) && gap > 0) {
                    findings["herniation"] = findings.getOrDefault("herniation", 0) + 1
                }
            }
        }

        val totalIssues = findings.values.sum()
        val isScoliosis = cobbAngle > 10

        val riskLevel = when {
            cobbAngle > 25 || totalIssues > 2 -> "HIGH"
            cobbAngle > 10 || totalIssues > 0 -> "MEDIUM"
            else -> "LOW"
        }

        return SpineAnalysisResult(cobbAngle, isScoliosis, findings, riskLevel)
    }

    private fun smoothPoints(points: List<PointF>, windowSize: Int = 3): List<PointF> {
        if (points.size < windowSize) return points
        val newPoints = mutableListOf<PointF>()
        for (i in points.indices) {
            val start = max(0, i - 1)
            val end = min(points.size, i + 2) // exclusive end
            val subList = points.subList(start, end)
            val avgX = subList.map { it.x }.average().toFloat()
            val avgY = subList.map { it.y }.average().toFloat()
            newPoints.add(PointF(avgX, avgY))
        }
        return newPoints
    }

    private fun calculateSmartCobbAngleV12(centers: List<PointF>): Float {
        if (centers.size < 5) return 0f
        val smoothPts = smoothPoints(centers)
        val angles = mutableListOf<Double>()

        // Trimming logic from Python
        var startTrim = 2
        var endTrim = smoothPts.size - 2
        if (startTrim >= endTrim) {
            startTrim = 0
            endTrim = smoothPts.size
        }

        for (i in startTrim until endTrim) {
            val pPrev = smoothPts[i - 1]
            val pNext = smoothPts[i + 1]
            val dy = pNext.y - pPrev.y
            val dx = pNext.x - pPrev.x
            val safeDy = if (dy == 0f) 0.001f else dy
            
            // atan returns radians, convert to degrees
            val angle = Math.toDegrees(atan(dx / safeDy.toDouble()))
            angles.add(angle)
        }

        if (angles.isEmpty()) return 0f

        val maxAngle = angles.maxOrNull() ?: 0.0
        val minAngle = angles.minOrNull() ?: 0.0
        
        return (maxAngle - minAngle).toFloat()
    }

    // ==========================================
    //    POSTURE ANALYSIS (From posturtespitmindsporeenglish.py)
    // ==========================================

    /**
     * @param keypoints Map of body parts to coordinates. 
     * Expects keys: "NOSE", "RIGHT_EAR", "LEFT_EAR", "RIGHT_SHOULDER", "LEFT_SHOULDER", "RIGHT_HIP", "LEFT_HIP"
     */
    fun analyzePosture(keypoints: Map<String, PointF>): PostureAnalysisResult {
        // Safe access helper
        fun getPt(key: String) = keypoints[key] ?: PointF(0f, 0f)

        // Coordinates (matching Python logic)
        val nose = getPt("NOSE")
        
        // Average Left/Right for Ear, Shoulder, Hip to get single point profile view simulated
        // Or if we know the direction, we pick one side. 
        // Python logic calculates averages:
        val earX = (getPt("RIGHT_EAR").x + getPt("LEFT_EAR").x) / 2
        // val earY = ... (not used for X diffs)
        
        val shoulderX = (getPt("RIGHT_SHOULDER").x + getPt("LEFT_SHOULDER").x) / 2
        val shoulderY = (getPt("RIGHT_SHOULDER").y + getPt("LEFT_SHOULDER").y) / 2
        
        val hipX = (getPt("RIGHT_HIP").x + getPt("LEFT_HIP").x) / 2
        val hipY = (getPt("RIGHT_HIP").y + getPt("LEFT_HIP").y) / 2

        // Direction logic
        val directionMultiplier = if (nose.x > shoulderX) 1 else -1 // 1 for RIGHT, -1 for LEFT

        var torsoLen = abs(hipY - shoulderY)
        if (torsoLen == 0f) torsoLen = 1f

        // Head Analysis
        val headDiff = (earX - shoulderX) * directionMultiplier
        var headStatus = "NORMAL"
        
        if (headDiff > (torsoLen * 0.15)) {
            headStatus = "FORWARD HEAD POSTURE"
        } else if (headDiff < -(torsoLen * 0.10)) {
            headStatus = "BACKWARD HEAD POSTURE"
        }

        // Kyphosis Analysis
        val shoulderDiff = (shoulderX - hipX) * directionMultiplier
        var kyphosisStatus = "NORMAL"
        
        if (shoulderDiff > (torsoLen * 0.12)) {
            kyphosisStatus = "KYPHOSIS (SLOUCHING)"
        }

        // Result Interpretation
        val rec = if (headStatus != "NORMAL" || kyphosisStatus != "NORMAL") {
            "CONSULT A DOCTOR"
        } else {
            "HEALTHY POSTURE"
        }

        // Scale to "cm" reference (dummy usage from Python)
        val deviationCm = (headDiff / torsoLen) * 50
        val tiltCm = (shoulderDiff / torsoLen) * 50

        return PostureAnalysisResult(
            headPosture = headStatus,
            kyphosisStatus = kyphosisStatus,
            deviationCm = deviationCm,
            tiltCm = tiltCm,
            recommendation = rec
        )
    }
}
