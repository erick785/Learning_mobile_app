---
title: 常用命令
order: 20
---

# 常用命令

```bash
# 查看已创建的虚拟设备
emulator -list-avds

# 启动指定模拟器
emulator -avd Pixel_10_API_36

# 查看连接的 Android 设备
adb devices

# 安装 APK
adb install path/to/app.apk

# 查看日志
adb logcat

# 清空日志缓冲后重新看（复现问题前先清一次，日志会干净很多）
adb logcat -c

# 截图到电脑
adb exec-out screencap -p > screenshot.png

# 关闭模拟器
adb emu kill
```

<!--
可以继续往下追加你实际用过的：改系统语言、模拟 GPS、调屏幕密度
（adb shell wm density）、录屏（adb shell screenrecord）、push/pull 文件、
模拟低内存等。只收真正用过的，别抄大全。
-->
