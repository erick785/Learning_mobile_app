---
title: 安装
order: 10
---

# 安装

1. 安装 [Xcode](https://developer.apple.com/xcode/)。
2. 首次启动会要求安装附加组件（Additional Components），装完。
3. Xcode → Settings → Platforms → 下载需要的 iOS 运行时版本。
   只装当前版本的话，多 iOS 版本适配就无从谈起。
4. 启动 Simulator：Xcode → Open Developer Tool → Simulator，或命令行 `open -a Simulator`。

<!--
两个建议补在这里的缺口：

1. Xcode 体积很大（十几 GB 起），App Store 下载与 developer.apple.com 直接下载
   的差别、以及国内网络下的可行路径，值得写一句。

2. 第 3 步下载的 runtime 是按 iOS 版本单独装的，磁盘占用会持续累积；
   怎么删掉不用的 runtime（Xcode → Settings → Platforms 里可删，
   或 xcrun simctl runtime 相关子命令）也可以记一下。
-->
