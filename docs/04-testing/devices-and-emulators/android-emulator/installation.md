---
title: 安装
order: 10
---

# 安装

1. 安装 [Android Studio](https://developer.android.com/studio)。
2. 打开 Android Studio → Settings/Preferences → SDK Manager：
   - 安装 Android SDK
   - 安装 Android SDK Platform（选一个较新的稳定版本）
   - 安装 Android Emulator
   - Apple Silicon Mac 选择 ARM64 系统镜像。
3. 打开 Device Manager → Create Device → 选择 Pixel → 下载系统镜像 → 创建并启动。

<!--
两个建议补在这里的缺口：

1. adb 与 emulator 默认不在 PATH 里。Android Studio 不会替你加，macOS 上实际位置是
   ~/Library/Android/sdk/platform-tools 与 ~/Library/Android/sdk/emulator。
   装完第一次在终端敲 adb devices 报 command not found 几乎是必经之路，
   写清怎么加到 shell 配置里（以及加完要重开终端或 source）。

2. 第 3 步「下载系统镜像」是个决策点：带 Google Play 的镜像才有 Play services。
   要测推送（FCM）、地图或任何依赖 Play services 的功能，必须选带 Play Store
   图标的那个；不带的事后想换得重建 AVD。
-->
