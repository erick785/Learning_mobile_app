---
title: 常用命令
order: 20
---

# 常用命令

以下语法均在 **Xcode 26.6** 上用 `xcrun simctl help <子命令>` 逐条查过。
`booted` 表示当前已启动的模拟器；多台同时启动时它会任选一台，此时应改用设备 UDID。

```bash
# 列出模拟器与运行时
xcrun simctl list devices
xcrun simctl list runtimes

# 启动 / 关闭
xcrun simctl boot "<device-name>"
xcrun simctl shutdown all
open -a Simulator                          # 打开图形界面

# 装包、启动、终止、卸载
xcrun simctl install booted app.app
xcrun simctl launch booted <bundle-id>
xcrun simctl terminate booted <bundle-id>
xcrun simctl uninstall booted <bundle-id>

# 打开深链 / URL Scheme
xcrun simctl openurl booted "<url>"

# 截图（默认 png，可选 tiff / bmp / gif / jpeg）
xcrun simctl io booted screenshot s.png

# 录屏（默认 hevc，Ctrl+C 停止；要通用格式加 --codec=h264）
xcrun simctl io booted recordVideo --codec=h264 v.mov

# 恢复出厂（测首次安装流程前用）
xcrun simctl erase all

# 权限：重置全部，或单独授予某项
xcrun simctl privacy booted reset all
xcrun simctl privacy booted grant photos <bundle-id>

# 暗色模式与系统字体大小
xcrun simctl ui booted appearance dark
xcrun simctl ui booted content_size increment

# 模拟推送（payload 是 JSON 文件）
xcrun simctl push booted <bundle-id> payload.apns

# 模拟定位：先看有哪些内置场景
xcrun simctl location booted list

# 状态栏固定值（截图前用，出图统一）
xcrun simctl status_bar booted override --time "9:41" --batteryLevel 100
```

<!--
几个可以继续补的方向，都是查证过存在但这里没收的子命令：

- simctl keychain       钥匙串操作，和安全那一块直接相关
- simctl addmedia       往相册/通讯录塞素材，测图片选择器要用
- simctl pbcopy/pbpaste/pbsync   Mac 与模拟器剪贴板互通
- simctl spawn          在模拟器内跑任意进程
- simctl clone / create / rename / upgrade / runtime   设备生命周期管理
- simctl diagnose       收集诊断信息与日志
- simctl get_app_container / appinfo / listapps   查 app 装在哪、装了什么

只收你真正用过的。另外 status_bar override 还有 --dataNetwork、--wifiMode、
--wifiBars、--cellularMode、--cellularBars、--operatorName、--batteryState 等 flag，
要拼「信号差 + 运营商名异常」这种截图场景时能用到。
-->
