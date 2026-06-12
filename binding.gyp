{
  "targets": [{
    "target_name": "windowlevel",
    "sources": ["native/windowlevel.mm"],
    "include_dirs": ["<!@(node -p \"require('node-addon-api').include_dir\")"],
    "libraries": ["-framework Cocoa", "-framework CoreGraphics"],
    "xcode_settings": {
      "CLANG_ENABLE_OBJC_ARC": "YES",
      "MACOSX_DEPLOYMENT_TARGET": "12.0",
      "OTHER_CFLAGS": ["-std=c++17"]
    },
    "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"]
  }]
}
