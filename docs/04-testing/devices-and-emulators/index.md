---
title: 真机与模拟器
order: 10
---

# 真机与模拟器

<!--
开篇写两三句：这一章解决什么问题。建议点明——
单元测试和 Widget 测试跑在 JVM / Dart VM 里，不涉及设备；
一旦要验证「用户真的看到什么、摸到什么」，就必须落到模拟器或真机上。
这两者能覆盖的范围差别很大，选错会白测。
-->

## 该用哪个

<!--
这一节是全章的判断依据，写清楚"什么情况用哪个"，不要写成设备介绍。
建议最后落成一个表格或几条硬规则，方便以后直接查。
-->

### 模拟器 / 仿真器能覆盖的

<!--
写：UI 布局与适配、页面跳转与路由、交互流程、接口联调、
本地存储读写、权限弹窗（Android 可以，iOS Simulator 受限）、
大部分功能回归。
补一句：这些东西占日常测试的大多数，所以模拟器是主力，真机是抽查。
-->

### 必须上真机的

<!--
逐条列，每条写一句"为什么模拟器测不了"：
- 推送通知（APNs / FCM）
- 相机实际成像（模拟器只能用假图片/摄像头替代）
- NFC、蓝牙、指纹/Face ID 等生物识别
- 真实性能与发热、真实电量消耗
- 真实网络与弱网（模拟器走宿主网络，模拟弱网只是近似）
- 厂商定制 ROM 的差异（后台杀进程、权限二次弹窗、自启动限制）
- 应用商店真实安装/升级/覆盖安装路径
-->

### iOS Simulator 的关键限制

<!--
这一节值得单独写，因为最容易被误解。要点：

Simulator 不是"模拟一台 iPhone"，它是在你的 Mac 上直接编译并运行
一份 x86_64 / arm64 的 Mac 原生构建，共享 macOS 内核。所以：

- 跑的不是真机上的 ARM iOS 二进制 → 性能数据完全不可参考
- 没有真实的 App Store 安装流程、没有沙盒隔离的真机语义
- 推送、NFC、蓝牙、相机、传感器基本不可用或高度受限
- 不能用来验证"真机上会不会崩"

对比一句：Android Emulator 是完整系统镜像（跑真正的 Android 内核与
系统服务），真实度显著高于 iOS Simulator。这个不对称是很多人踩的坑。
-->

<!--
Android 与 iOS 两个平台的具体内容已拆为同级子目录，侧边栏中是本节下的可折叠分组：
- android-emulator/  → Android 模拟器（含子页「安装」）
- ios-simulator/     → iOS 模拟器
主页只保留跨平台的判断依据与通用内容。
-->

## Flutter 侧的设备识别

<!--
写你实际用的命令与真实输出。建议贴一段 `flutter devices` 的实际结果，
说明 id 长什么样、后面 -d 要用哪个字段。
-->

```bash
# 列出所有可用设备
flutter devices

# 指定设备运行
flutter run -d <device-id>

# 在指定设备上截图
flutter screenshot --out=shot.png -d <device-id>
```

## 两端命令对照

<!--
这一节演示本书的 code group 写作约定：VitePress 会渲染成并排 tab。
适合放「同一件事、两端做法不同」的命令，比如截图、装包、清数据、看日志各一组。
不需要的话整节删掉。
-->

::: code-group

```bash [Android / adb]
# 截图
adb exec-out screencap -p > screenshot.png
```

```bash [iOS / simctl]
# 截图
xcrun simctl io booted screenshot s.png
```

:::

## 真机连接

<!--
两小节都写到「照着做能连上」，并写清失败时长什么样。
真机连接是环境问题重灾区，把报错原文记下来比写结论有用。
-->

### Android：USB 与无线调试

<!--
覆盖：
- 开发者选项怎么打开（连点版本号）、USB 调试开关
- USB 连上后设备会弹「允许 USB 调试吗」，指纹要勾记住
- adb devices 显示 unauthorized / offline / no permissions 各是什么原因
- 无线调试两种路径：
  - Android 11+：设置里开「无线调试」→ 配对码 → adb pair → adb connect
  - 更老版本：先 USB 连上 → adb tcpip 5555 → 拔线 → adb connect <ip>:5555
- macOS 上的 USB 权限问题
-->

```bash
# Android 11+ 无线调试
adb pair <ip>:<pair-port>      # 用手机上显示的配对码
adb connect <ip>:<connect-port>

# 老版本：先 USB，再切 TCP
adb tcpip 5555
adb connect <ip>:5555
```

### iOS：信任、签名与无线调试

<!--
覆盖：
- 首次插上要点「信任此电脑」
- 真机安装必须有签名：免费 Apple ID 与付费开发者账号的区别
  （免费账号签名的 app 有效期约 7 天，且 bundle id 受限）
- Xcode → Window → Devices and Simulators 看设备与日志
- 无线调试：同一 Wi-Fi + Devices 里勾 "Connect via network"
- Flutter 真机运行需要 flutter run -d <ios-device-id>，
  首次会卡在签名配置上，把踩到的具体报错写在这里
-->

## 模拟器测不出来的东西

<!--
这一节是本章最有价值的部分，因为它决定「哪些 bug 会漏到线上」。
每条写：现象是什么、为什么模拟器上不出现、你打算怎么补测。
-->

### 性能

<!--
模拟器的 GPU 走宿主、CPU 架构与真机不同，帧率/启动耗时/内存都不可参考。
写：真机上用什么工具量（Android: Perfetto / Macrobenchmark / GPU 呈现模式分析；
iOS: Instruments / Xcode Organizer 的 MetricKit），以及你关心的指标阈值。
-->

### 屏幕

<!--
写实际会出问题的差异：
- 刘海/挖孔/圆角导致的安全区（SafeArea）遮挡
- 不同 dpi 下 1px 边框、图标模糊
- 高刷新率（90/120Hz）下的动画表现
- 大字体/显示大小（系统级字体缩放）把布局撑破
- 折叠屏与分屏
- 横竖屏切换时的状态保持
建议这里配真机截图对比，比文字有效。
-->

### 传感器与硬件

<!--
GPS 定位漂移、加速度计/陀螺仪、NFC、蓝牙配对、
指纹与 Face ID、近距离感应（通话时息屏）、Haptic 反馈。
写清哪些在 Android Emulator 上可以模拟（扩展控制面板里有）、
哪些只能真机。
-->

### 网络

<!--
模拟器共享宿主网络，「弱网」只是近似。写：
- 真机弱网怎么造（路由器限速、Charles/mitmproxy 的 throttle、
  Android Emulator 的 network speed 设置、开发者选项里的网络模拟）
- 超时、重试、断网重连、Wi-Fi 与蜂窝切换、飞行模式
- DNS 与证书：抓包时模拟器与真机装 CA 证书的路径不同，
  Android 7+ 用户证书默认不被信任，这块单独写清楚
-->

## 设备矩阵怎么定

<!--
写你自己的选取规则，不要抄网上的通用矩阵。建议落到一张表：
维度 = 系统版本 × 屏幕尺寸/密度 × 厂商 ROM × 性能档位（高端/低端）。
说明你为什么这么选（目标用户分布？还是踩过某个机型的坑？），
以及最低必须覆盖的几台是什么。

厂商 ROM 差异值得单独强调：小米/华为/OPPO/vivo 在后台保活、
自启动、权限二次确认、通知栏折叠上的行为各不相同，
这是国内 app 线上问题的一大来源。
-->

## 云真机

<!--
如果用过就写实际体验与坑；没用过就写「为什么暂时不用」，别留空标题。
可选项：Firebase Test Lab、BrowserStack、AWS Device Farm、
腾讯 WeTest、阿里 MQC。
关注点：能不能装自己的 apk/ipa、能不能交互操作、
有没有国内厂商机型、日志和截图好不好拿、免费额度多少。
-->

## 踩坑记录

<!--
这一节按时间往下追加，每条写成：
现象（贴报错原文）→ 原因 → 解法。
环境类问题重复踩的成本很高，报错原文比结论更有检索价值。
-->
