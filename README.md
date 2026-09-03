# 移动端开发学习笔记

按主题组织的移动端开发手册，用 VitePress 构建，发布在
<https://erick785.github.io/Learning_mobile_app/>。

## 本地跑

```bash
npm install
npm run docs:dev      # 开发，热更新
npm run docs:build    # 构建到 docs/.vitepress/dist
npm run docs:preview  # 预览构建产物（带 base 路径）
```

验证部署效果必须用 `docs:preview`，不要直接 serve `dist/`——后者不带
`/Learning_mobile_app/` 前缀，会掩盖 base 配置错误。

## 怎么加一章

**不需要改任何配置文件。** 侧边栏由 `vitepress-sidebar` 扫描文件系统自动生成。

1. 在对应块目录下新建 `.md`，文件名用英文 kebab-case：

   ```
   docs/01-fundamentals/async-programming.md
   ```

2. 写 frontmatter，`order` 用 10 的间隔，方便日后在中间插入：

   ```yaml
   ---
   title: 异步编程
   order: 20
   ---
   ```

   侧边栏显示的是 `title`，不是文件名。排序由 `order` 驱动，与文件名字母序无关
   （已用红→绿实测确认，过程记录在 `specs/2026-09-03-mobile-learning-ebook-plan.md`
   的「实现期发现」小节）。

   **`order` 别漏写**：缺失时插件按默认值 `0` 处理，而块首页「概览」是 `order: 1`，
   漏写的章节会排到「概览」**前面**去。章节的 `order` 一律从 `10` 起跳就不会撞上。

3. 回到该块的 `index.md`，把规划清单里对应那条**改成指向章节的链接**：

   ```markdown
   - [异步编程](./async-programming.md)
   ```

   约定是**链接即已完成、纯文本即待写**，进度不需要图例就能看出来。
   不要用 `- [ ]` / `- [x]` 复选框语法：VitePress 1.6.4 不支持 markdown-it 的
   task list，会原样渲染成字面的方括号文本。

4. `npm run docs:dev` 确认侧边栏位置正确，然后提交。

## 图片

与章节同目录建一个与章节同名的子文件夹，用**相对路径**引用：

```
docs/01-fundamentals/
├─ index.md
├─ async-programming.md
└─ async-programming/
   └─ event-loop.png
```

```markdown
![](./async-programming/event-loop.png)
```

相对路径由 Vite 资源管线处理，会自动加 base 前缀。
**不要**把内容图片放进 `docs/public/` 再用绝对路径引用——GitHub Pages 项目页
有 base 前缀，那样写容易整站图片 404。`public/` 只放必须保留原始文件名的资源
（favicon、CNAME）。

## 代码示例

同一件事的多语言写法用 code group 做成并排 tab：

````markdown
::: code-group

```dart [Dart]
// ...
```

```kotlin [Kotlin]
// ...
```

```swift [Swift]
// ...
```

:::
````

行内高亮用 `// [!code highlight]`，聚焦用 `// [!code focus]`。

`dart`、`kotlin`、`swift` 都在 Shiki 内置语言里，无需配置。
**注意 Shiki 没有 `gradle` 语言**：`build.gradle` 标 `groovy`，
`build.gradle.kts` 标 `kotlin`。

## 目录结构

```
├─ .github/workflows/deploy.yml   推 main 自动发布
├─ specs/                         设计文档、实现计划与实现期发现
└─ docs/                          书稿（VitePress srcDir）
   ├─ .vitepress/config.ts
   ├─ public/                     仅 favicon 等需保留原名的文件
   ├─ index.md                    首页
   ├─ 01-fundamentals/            基础
   ├─ 02-client/                  客户端开发
   ├─ 03-engineering/             工程化
   ├─ 04-testing/                 测试
   └─ 05-security/                安全
```

`specs/` 刻意放在 `docs/` 之外：`docs/` 是 VitePress srcDir，
元文档放进去会被当成书页构建进站点。

五大块内部**保持扁平、不嵌套子目录**。触发引入嵌套的阈值：单块章节数超过约 20 篇。

## 改配置前先看这里

`docs/.vitepress/config.ts` 里有几处「看起来可以简化、实际会坏」的地方，
动手前请先读 `specs/2026-09-03-mobile-learning-ebook-plan.md` 末尾的
**实现期发现**各条，每条都记录了现象、根因和验证方法。要点：

- **不要开 `cleanUrls`**：GitHub Pages 不为 `foo.html` 提供 `/foo` 路由，会全站 404
- **不要设 `ignoreDeadLinks`**：死链报错是刻意保留的保护，已实测确实生效
- **`tokenize` 函数必须自包含**：VitePress 用 `_vp-fn_` 序列化它、客户端用
  `new Function` 重建，作用域是全局。函数体引用任何模块级变量都会导致
  构建全绿但浏览器里搜索直接抛 `ReferenceError`。正则已内联，别再提取出去
- **`.gitignore` 里的 `**/` 前缀不是笔误**：改回 `docs/` 前缀会让根目录误跑
  vitepress 产生的缓存重新污染 `git status`

## 部署

推送到 `main` 即自动构建发布，workflow 见 `.github/workflows/deploy.yml`。

**首次部署前必须手动做一次**：仓库 Settings → Pages → Build and deployment →
Source 选 **GitHub Actions**。这一步不在 git 可触达范围内，没做的话 workflow
会成功但站点不更新，且不报错。

## 依赖版本

`vitepress` 与 `vitepress-sidebar` 都锁精确版本（不带 `^`），升级需显式改
`package.json` 并重新验证。刻意不用 VitePress 2.0（目前仅 alpha）。
