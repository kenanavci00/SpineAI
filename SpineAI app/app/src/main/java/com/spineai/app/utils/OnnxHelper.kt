package com.spineai.app.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.RectF
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import ai.onnxruntime.OnnxTensor
import java.nio.FloatBuffer
import java.util.Collections
import kotlin.math.max
import kotlin.math.min

data class BoundingBox(
    val x1: Float,
    val y1: Float,
    val x2: Float,
    val y2: Float,
    val cx: Float,
    val cy: Float,
    val w: Float,
    val h: Float,
    val score: Float
)

object OnnxHelper {
    private var ortEnv: OrtEnvironment? = null
    private var ortSession: OrtSession? = null

    fun initialize(context: Context) {
        if (ortEnv == null) {
            ortEnv = OrtEnvironment.getEnvironment()
            // Load "best.onnx" from assets
            val modelBytes = context.assets.open("best.onnx").readBytes()
            ortSession = ortEnv?.createSession(modelBytes)
        }
    }

    fun detectSpine(bitmap: Bitmap): List<BoundingBox> {
        if (ortEnv == null || ortSession == null) return emptyList()

        // 1. Resize to 640x640
        val resizedBitmap = Bitmap.createScaledBitmap(bitmap, 640, 640, true)

        // 2. Prepare Input Tensor [1, 3, 640, 640]
        val floatBuffer = FloatBuffer.allocate(1 * 3 * 640 * 640)
        floatBuffer.rewind()
        
        val intValues = IntArray(640 * 640)
        resizedBitmap.getPixels(intValues, 0, 640, 0, 0, 640, 640)

        // Normalize 0..255 -> 0..1
        for (pixelValue in intValues) {
            val r = ((pixelValue shr 16) and 0xFF) / 255.0f
            val g = ((pixelValue shr 8) and 0xFF) / 255.0f
            val b = (pixelValue and 0xFF) / 255.0f
            
            floatBuffer.put(r)
            floatBuffer.put(g)
            floatBuffer.put(b)
        }
        floatBuffer.flip() // Prepare for reading

        // Fix: YOLOv8 expects NCHW (Batch, Channels, Height, Width)
        // We put RGB sequentially, but we need to rearrange if the buffer isn't automatically NCHW.
        // Actually, the above loop puts R then G then B for EACH pixel (Interleaved: R1, G1, B1, R2, G2, B2...).
        // YOLO expects Planar: R1, R2... Rn, G1, G2... Gn, B1, B2... Bn.
        // Let's rewrite the buffer filling to be Planar.
        
        val planarBuffer = FloatBuffer.allocate(1 * 3 * 640 * 640)
        for (i in 0 until 640 * 640) {
            val pixelValue = intValues[i]
            planarBuffer.put(i, ((pixelValue shr 16) and 0xFF) / 255.0f) //  R at i
            planarBuffer.put(640 * 640 + i, ((pixelValue shr 8) and 0xFF) / 255.0f) // G at Offset + i
            planarBuffer.put(2 * 640 * 640 + i, (pixelValue and 0xFF) / 255.0f) // B at 2*Offset + i
        }
        planarBuffer.rewind() // Ready to read

        val inputName = ortSession!!.inputNames.iterator().next()
        val shape = longArrayOf(1, 3, 640, 640)
        val inputTensor = OnnxTensor.createTensor(ortEnv, planarBuffer, shape)

        // 3. Run Inference
        val results = ortSession!!.run(Collections.singletonMap(inputName, inputTensor))
        
        // 4. Parse Output
        // YOLOv8 output is [1, 5, 8400] usually (cx, cy, w, h, score)
        // Or [1, 4+num_classes, 8400]
        val outputTensor = results[0] as OnnxTensor
        val rawOutput = outputTensor.floatBuffer
        // We expecting [1, 5, 8400] which is flattened
        
        // Check dimensions to be safe? assuming standard YOLOv8 export
        // dimensions: [1, 5, 8400]
        val numAnchors = 8400
        val numAttributes = 5 // cx, cy, w, h, score (if only 1 class "spine point/vertebra")

        val boxes = ArrayList<BoundingBox>()
        
        // Output Layout:
        // [batch, channel, anchor]
        // channel 0: cx
        // channel 1: cy
        // channel 2: w
        // channel 3: h
        // channel 4: score
        
        // Since it's flattened, index = (channel * numAnchors) + anchor
        
        for (i in 0 until numAnchors) {
            val score = rawOutput.get(4 * numAnchors + i)
            if (score > 0.25f) {
                val cx = rawOutput.get(0 * numAnchors + i)
                val cy = rawOutput.get(1 * numAnchors + i)
                val w = rawOutput.get(2 * numAnchors + i)
                val h = rawOutput.get(3 * numAnchors + i)
                
                val x1 = cx - w / 2
                val y1 = cy - h / 2
                val x2 = cx + w / 2
                val y2 = cy + h / 2

                boxes.add(BoundingBox(x1, y1, x2, y2, cx, cy, w, h, score))
            }
        }

        // 5. Apply NMS
        val nmsBoxes = nonMaxSuppression(boxes, 0.45f)
        
        // Scale back to original image size if needed? 
        // For now returning 640x640 coords.
        // The Engine can handle 640 coords if we just analyze curvature.
        // But better to return relative or assume 640 is fine for "analysis".
        return nmsBoxes
    }

    private fun nonMaxSuppression(boxes: List<BoundingBox>, iouThreshold: Float): List<BoundingBox> {
        val sorted = boxes.sortedByDescending { it.score }.toMutableList()
        val selected = ArrayList<BoundingBox>()

        while (sorted.isNotEmpty()) {
            val current = sorted.removeAt(0)
            selected.add(current)
            
            val iterator = sorted.iterator()
            while (iterator.hasNext()) {
                val next = iterator.next()
                if (calculateIoU(current, next) > iouThreshold) {
                    iterator.remove()
                }
            }
        }
        return selected
    }

    private fun calculateIoU(a: BoundingBox, b: BoundingBox): Float {
        val xA = max(a.x1, b.x1)
        val yA = max(a.y1, b.y1)
        val xB = min(a.x2, b.x2)
        val yB = min(a.y2, b.y2)

        val interArea = max(0f, xB - xA) * max(0f, yB - yA)
        val boxAArea = a.w * a.h
        val boxBArea = b.w * b.h
        
        return interArea / (boxAArea + boxBArea - interArea)
    }
}
