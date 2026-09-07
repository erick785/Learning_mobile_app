---
title: iOS 模拟器
order: 20
---

# iOS 模拟器

安装见 [安装](./installation.md)，命令见 [常用命令](./commands.md)。

以下以 **Xcode 26.6（Build 17F113）/ macOS 26.5.1** 为准，`simctl` 的子命令与选项
都在该版本上实际查过（CoreSimulator-1051.55）。

## 它是什么

Simulator 不是虚拟机，也不运行 iOS。Xcode 把你的 app 编译成 Mac 架构的原生二进制
（Apple Silicon 上是 arm64），链接一套 Simulator 专用的 iOS 框架变体，直接跑在 macOS 上。
所以它启动快、能直接读写 Mac 的文件系统与剪贴板——但也因此**性能数据完全不可参考**。
Apple 的原话：

> Simulator is not an accurate test of an app's performance, memory usage, and networking
> speed... always test the performance of your app's user interface on a device.

这是它与 Android Emulator 的根本差别：后者是完整系统镜像、跑真 Android 内核，
模拟器上的结论大多能推到真机；Simulator 的性能结论推不过去。
哪些东西必须上真机，见主页 [必须上真机的](../index.md#必须上真机的)。

## 开发时用

- **日常循环**：Simulator 已在跑时 Xcode 里 Cmd+R 几乎秒起
- **多 iOS 版本适配**：Xcode → Settings → Platforms 下载多个 runtime，同一台 Mac 上并存
- **多机型适配**：不同尺寸、刘海与灵动岛、iPad；`simctl clone` 可快速复制一台设备
- **重测首次启动**：`simctl erase` 恢复出厂；只重置权限用 `simctl privacy booted reset all`
- **切暗色模式与字体大小**：`simctl ui booted appearance dark`、`content_size increment`
- **深链唤起**：`simctl openurl booted "myapp://path"`

## 测试时用

边界和 Android 不一样：**Flutter 的 `flutter test`（单元与 Widget 测试）跑在 Dart VM 上，
不需要 Simulator；原生 iOS 的 XCTest 需要**——测试宿主是 app 本身，必须有运行环境。
集成测试两边都需要设备。

CI 上不必打开 Simulator 图形界面，`simctl boot` 起一个无窗口实例交给 `xcodebuild`：

```bash
xcrun simctl boot "<device-name>"
xcodebuild test -project ios/Runner.xcodeproj -scheme Runner \
  -destination 'platform=iOS Simulator,name=<device-name>'
```

## 菜单与 simctl 的额外能力

Android 靠扩展控制面板，iOS 靠 Simulator 的菜单（Device / Features / Debug）加 `simctl`。
下面这些都在 Xcode 26.6 上确认存在：

- **推送**：`simctl push <device> <bundle-id> payload.apns`。这条常被搞错——Apple
  归档文档（iOS 8.2 时代）明说推送不可测，但 `simctl push` 早已存在。它测的是本地投递
  与 app 的处理逻辑，真实 APNs 链路仍需真机
- **位置**：`simctl location <device> list` 看内置场景，也可喂 `.gpx` 文件
- **权限**：`simctl privacy <device> grant|revoke|reset <service>`；service 有
  location、photos、microphone、contacts、calendar、motion、siri 等，`all` 表示全部
- **相册与通讯录**：`simctl addmedia` 塞照片、视频、联系人
- **钥匙串**：`simctl keychain`
- **状态栏**：`simctl status_bar`，截图前把电量、信号、时间固定下来
- **剪贴板**：`simctl pbcopy` / `pbpaste` / `pbsync`，Mac 与模拟器互通
- **在模拟器内跑进程**：`simctl spawn`
- **设备生命周期**：`create` / `clone` / `rename` / `upgrade` / `runtime`

<!--
和 Android 那节一样：补上你实际用过哪些、用它抓到过什么 bug，那才有参考价值。
另外 Face ID / Touch ID 的模拟在 Simulator 的 Features 菜单里，本次未验证，
你用到时确认一下再写。
-->
