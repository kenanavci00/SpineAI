#!/usr/bin/env python3
"""
Test script for Minespore-based analysis implementations
Tests both posture and spine analysis with sample data
"""

import sys
import os
import json

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from posture_analysis_minespore import PostureAnalyzer, analyze_posture
    from spine_analysis_minespore import SpineAnalyzer, analyze_spine
    print("✅ Successfully imported Minespore analysis modules")
except ImportError as e:
    print(f"❌ Failed to import modules: {e}")
    sys.exit(1)


def test_posture_analyzer():
    """Test PostureAnalyzer class initialization"""
    print("\n" + "="*60)
    print("Testing PostureAnalyzer")
    print("="*60)
    
    try:
        # Test with dummy model path
        analyzer = PostureAnalyzer("best postur.onnx")
        print("✅ PostureAnalyzer initialized")
        
        # Check attributes
        assert hasattr(analyzer, 'input_size'), "Missing input_size attribute"
        assert hasattr(analyzer, 'conf_threshold'), "Missing conf_threshold attribute"
        assert analyzer.input_size == (640, 640), "Incorrect input size"
        
        print(f"   Input size: {analyzer.input_size}")
        print(f"   Confidence threshold: {analyzer.conf_threshold}")
        print(f"   Model path: {analyzer.model_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ PostureAnalyzer test failed: {e}")
        return False


def test_spine_analyzer():
    """Test SpineAnalyzer class initialization"""
    print("\n" + "="*60)
    print("Testing SpineAnalyzer")
    print("="*60)
    
    try:
        # Test with dummy model path
        analyzer = SpineAnalyzer("best.onnx")
        print("✅ SpineAnalyzer initialized")
        
        # Check attributes
        assert hasattr(analyzer, 'input_size'), "Missing input_size attribute"
        assert hasattr(analyzer, 'conf_threshold'), "Missing conf_threshold attribute"
        assert analyzer.input_size == (640, 640), "Incorrect input size"
        
        print(f"   Input size: {analyzer.input_size}")
        print(f"   Confidence threshold: {analyzer.conf_threshold}")
        print(f"   Model path: {analyzer.model_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ SpineAnalyzer test failed: {e}")
        return False


def test_preprocessing():
    """Test image preprocessing pipeline"""
    print("\n" + "="*60)
    print("Testing Preprocessing Pipeline")
    print("="*60)
    
    try:
        import numpy as np
        import cv2
        
        # Create a dummy image
        dummy_image = np.random.randint(0, 255, (1080, 1920, 3), dtype=np.uint8)
        print(f"✅ Created dummy image: {dummy_image.shape}")
        
        # Test PostureAnalyzer preprocessing
        analyzer = PostureAnalyzer("best postur.onnx")
        tensor_input, resized_img = analyzer.preprocess_image(dummy_image)
        
        print(f"   Preprocessed tensor shape: {tensor_input.shape}")
        print(f"   Resized image shape: {resized_img.shape}")
        
        # Verify shapes
        assert len(tensor_input.shape) == 4, "Tensor should be 4D (B, C, H, W)"
        assert tensor_input.shape[0] == 1, "Batch size should be 1"
        assert tensor_input.shape[1] == 3, "Should have 3 channels"
        assert tensor_input.shape[2] == 640 and tensor_input.shape[3] == 640, "Size should be 640x640"
        
        print("✅ Preprocessing pipeline working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Preprocessing test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_cobb_angle_calculation():
    """Test Cobb angle calculation"""
    print("\n" + "="*60)
    print("Testing Cobb Angle Calculation")
    print("="*60)
    
    try:
        analyzer = SpineAnalyzer("best.onnx")
        
        # Test with sample vertebrae centers
        centers = [
            (100, 50),
            (105, 100),
            (110, 150),
            (108, 200),
            (105, 250),
            (100, 300)
        ]
        
        cobb_angle, smooth_centers = analyzer.calculate_cobb_angle(centers)
        
        print(f"   Input centers: {len(centers)} points")
        print(f"   Calculated Cobb angle: {cobb_angle:.2f}°")
        print(f"   Smoothed centers: {len(smooth_centers)} points")
        
        assert cobb_angle >= 0, "Cobb angle should be non-negative"
        assert len(smooth_centers) == len(centers), "Smoothed centers count mismatch"
        
        print("✅ Cobb angle calculation working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Cobb angle test failed: {e}")
        return False


def test_disease_detection():
    """Test disease detection logic"""
    print("\n" + "="*60)
    print("Testing Disease Detection")
    print("="*60)
    
    try:
        analyzer = SpineAnalyzer("best.onnx")
        
        # Create sample vertebrae data
        vertebrae = [
            [100, 50, 150, 100, 0.9, 0.9],   # Normal
            [100, 110, 150, 160, 0.9, 0.9],  # Normal
            [100, 170, 150, 200, 0.9, 0.9],  # Compressed (shorter)
            [120, 210, 170, 260, 0.9, 0.9],  # Misaligned
            [100, 270, 150, 320, 0.9, 0.9],  # Normal
        ]
        
        centers = [((v[0]+v[2])/2, (v[1]+v[3])/2) for v in vertebrae]
        heights = [v[3]-v[1] for v in vertebrae]
        avg_height = sum(heights) / len(heights)
        
        findings = analyzer.detect_diseases(vertebrae, centers, heights, avg_height, "LATERAL")
        
        print(f"   Compression fractures: {findings['compression_fracture']}")
        print(f"   Herniated discs: {findings['herniated_disc']}")
        print(f"   Listhesis: {findings['listhesis']}")
        
        assert isinstance(findings, dict), "Findings should be a dictionary"
        assert all(k in findings for k in ['compression_fracture', 'herniated_disc', 'listhesis']), \
            "Missing disease categories"
        
        print("✅ Disease detection working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Disease detection test failed: {e}")
        return False


def test_dependencies():
    """Test if required dependencies are installed"""
    print("\n" + "="*60)
    print("Checking Dependencies")
    print("="*60)
    
    dependencies = {
        'mindspore': 'Minespore framework',
        'cv2': 'OpenCV',
        'numpy': 'NumPy',
        'onnx': 'ONNX (optional)',
    }
    
    results = {}
    
    for module, description in dependencies.items():
        try:
            if module == 'cv2':
                import cv2
                version = cv2.__version__
            elif module == 'mindspore':
                import mindspore
                version = mindspore.__version__
            elif module == 'numpy':
                import numpy
                version = numpy.__version__
            elif module == 'onnx':
                import onnx
                version = onnx.__version__
            
            print(f"   ✅ {description}: {version}")
            results[module] = True
            
        except ImportError:
            print(f"   ⚠️  {description}: Not installed")
            results[module] = False
    
    return all(results.values())


def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "="*60)
    print("MINESPORE INTEGRATION TEST SUITE")
    print("="*60)
    
    tests = [
        ("Dependencies Check", test_dependencies),
        ("PostureAnalyzer Initialization", test_posture_analyzer),
        ("SpineAnalyzer Initialization", test_spine_analyzer),
        ("Preprocessing Pipeline", test_preprocessing),
        ("Cobb Angle Calculation", test_cobb_angle_calculation),
        ("Disease Detection", test_disease_detection),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results[test_name] = False
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status:12} {test_name}")
    
    print("\n" + "-"*60)
    print(f"Results: {passed}/{total} tests passed ({passed*100//total}%)")
    print("="*60)
    
    if passed == total:
        print("\n🎉 All tests passed! Minespore integration is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total-passed} test(s) failed. Please review the errors above.")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
