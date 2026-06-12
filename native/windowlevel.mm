#include <napi.h>
#import <Cocoa/Cocoa.h>
#import <CoreGraphics/CoreGraphics.h>

static NSWindow* windowFromHandle(const Napi::CallbackInfo& info) {
    Napi::Buffer<char> buf = info[0].As<Napi::Buffer<char>>();
    void* ptr = *reinterpret_cast<void**>(buf.Data());
    NSView* view = (__bridge NSView*)ptr;
    return [view window];
}

// kCGDesktopWindowLevel (-2147483623): sits above the wallpaper, below all app windows
Napi::Value SetDesktopLevel(const Napi::CallbackInfo& info) {
    @autoreleasepool {
        NSWindow* win = windowFromHandle(info);
        [win setLevel:kCGDesktopWindowLevel];
        [win setCollectionBehavior:
            NSWindowCollectionBehaviorStationary |
            NSWindowCollectionBehaviorCanJoinAllSpaces |
            NSWindowCollectionBehaviorIgnoresCycle];
    }
    return info.Env().Undefined();
}

Napi::Value SetNormalLevel(const Napi::CallbackInfo& info) {
    @autoreleasepool {
        NSWindow* win = windowFromHandle(info);
        [win setLevel:NSNormalWindowLevel];
        [win setCollectionBehavior:NSWindowCollectionBehaviorDefault];
    }
    return info.Env().Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("setDesktopLevel", Napi::Function::New(env, SetDesktopLevel));
    exports.Set("setNormalLevel",  Napi::Function::New(env, SetNormalLevel));
    return exports;
}

NODE_API_MODULE(windowlevel, Init)
