package com.spineai.app.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.InputStream
import kotlin.math.max
import kotlin.math.min

object ImageUtils {

    fun loadBitmapFromUri(context: Context, uri: Uri, maxDimension: Int = 1024): Bitmap? {
        // 1. Decode bounds only
        var input: InputStream? = null
        try {
            input = context.contentResolver.openInputStream(uri)
            val options = BitmapFactory.Options()
            options.inJustDecodeBounds = true
            BitmapFactory.decodeStream(input, null, options)
            input?.close()

            if (options.outWidth == -1 || options.outHeight == -1) return null

            // 2. Calculate inSampleSize
            options.inSampleSize = calculateInSampleSize(options, maxDimension, maxDimension)

            // 3. Decode full image with subsampling
            options.inJustDecodeBounds = false
            input = context.contentResolver.openInputStream(uri)
            val bitmap = BitmapFactory.decodeStream(input, null, options)
            input?.close()
            return bitmap

        } catch (e: Exception) {
            e.printStackTrace()
            return null
        } finally {
            input?.close()
        }
    }

    private fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
        val (height: Int, width: Int) = options.run { outHeight to outWidth }
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight: Int = height / 2
            val halfWidth: Int = width / 2

            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }

        return inSampleSize
    }
}
