#!/usr/bin/env python3
"""
Test script to verify Python environment for spine analysis
"""

import sys
import json

def test_imports():
    """Test if all required packages are installed"""
    results = {
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "packages": {}
    }
    
    # Test ultralytics
    try:
        import ultralytics
        results["packages"]["ultralytics"] = {
            "installed": True,
            "version": ultralytics.__version__
        }
    except ImportError as e:
        results["packages"]["ultralytics"] = {
            "installed": False,
            "error": str(e)
        }
    
    # Test opencv
    try:
        import cv2
        results["packages"]["opencv-python"] = {
            "installed": True,
            "version": cv2.__version__
        }
    except ImportError as e:
        results["packages"]["opencv-python"] = {
            "installed": False,
            "error": str(e)
        }
    
    # Test numpy
    try:
        import numpy
        results["packages"]["numpy"] = {
            "installed": True,
            "version": numpy.__version__
        }
    except ImportError as e:
        results["packages"]["numpy"] = {
            "installed": False,
            "error": str(e)
        }
    
    # Test torch
    try:
        import torch
        results["packages"]["torch"] = {
            "installed": True,
            "version": torch.__version__,
            "cuda_available": torch.cuda.is_available()
        }
    except ImportError as e:
        results["packages"]["torch"] = {
            "installed": False,
            "error": str(e)
        }
    
    return results

def check_model_file():
    """Check if model file exists"""
    import os
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
    return {
        "model_path": model_path,
        "exists": os.path.exists(model_path)
    }

if __name__ == "__main__":
    print("🔍 Testing Python Environment for Spine Analysis\n")
    print("=" * 60)
    
    # Test imports
    results = test_imports()
    print(f"\n✅ Python Version: {results['python_version']}")
    print("\n📦 Package Status:")
    print("-" * 60)
    
    all_installed = True
    for package, info in results["packages"].items():
        if info["installed"]:
            version = info.get("version", "unknown")
            print(f"✅ {package:20} v{version}")
            if package == "torch" and "cuda_available" in info:
                cuda_status = "✅ CUDA Available" if info["cuda_available"] else "⚠️  CPU Only"
                print(f"   └─ {cuda_status}")
        else:
            print(f"❌ {package:20} NOT INSTALLED")
            print(f"   └─ Error: {info.get('error', 'Unknown')}")
            all_installed = False
    
    # Check model
    print("\n" + "=" * 60)
    print("\n🤖 Model Status:")
    print("-" * 60)
    model_info = check_model_file()
    if model_info["exists"]:
        print(f"✅ Model found: {model_info['model_path']}")
    else:
        print(f"❌ Model NOT found: {model_info['model_path']}")
        print("   └─ Please place your trained YOLO model at this location")
    
    print("\n" + "=" * 60)
    
    if all_installed and model_info["exists"]:
        print("\n✅ Environment is ready for spine analysis!")
        sys.exit(0)
    elif all_installed and not model_info["exists"]:
        print("\n⚠️  Python packages OK, but model file is missing")
        print("   Run: Place best.pt in backend/models/ directory")
        sys.exit(1)
    else:
        print("\n❌ Missing required packages")
        print("   Run: pip install -r requirements.txt")
        sys.exit(1)
