# 移动端学习电子书 — 设计文档

日期：2026-09-03
状态：已确认，待实现

## 背景与目标

仓库 `Learning_mobile_app` 目前是空的（`main` 分支上没有任何 commit，remote 指向
`github.com/erick785/Learning_mobile_app`）。目标是把移动端开发的学习成果沉淀成一本
**以网页阅读和分享为主**的书。

不是博客，不是时间线日记，是一本可以当手册查阅的主题式技术书。

## 已确认的决策

| 决策项 | 结论 |
| --- | --- |
| 构建工具 | VitePress（网页优先，不做 EPUB/PDF 导出） |
| 内容组织 | 纯主题，五大块，**不留时间线/日志区** |
| 目标读者 | 自己日后查阅 + 同行偶尔翻。行文紧凑，可用缩写，直接给结论，不需要教学语气 |
| 部署 | GitHub Pages 项目页 |
| 首版内容量 | 只搭空骨架，不写真实章节正文 |
| 侧边栏维护 | 插件自动生成（方案 B） |
| 骨架粒度 | 5 个块的 `index.md` + 块首页内含规划清单（方案 c） |

### 技术栈范围

书覆盖多语言，不是单一平台：

1. **基础** — Dart（Flutter）、Kotlin（Android）、Swift（iOS）；Git、命令行、HTTP/JSON、
   REST API；数据结构、异步编程、网络与安全基础
2. **客户端开发** — 跨平台优先 Flutter（UI、状态管理、路由、动画、插件）；原生补充
   Android Kotlin/Jetpack、iOS Swift/SwiftUI；本地存储、登录鉴权、推送通知、
   文件/相机/定位等系统能力
3. **工程化** — 分层架构、状态管理、错误处理、日志；依赖管理、环境配置、打包签名、
   发布到应用商店；CI/CD
4. **测试** — 单元、Widget/UI、集成；真机/模拟器；接口、弱网、兼容性、性能、崩溃监控
5. **安全** — 不明文保存 token/密码/私钥；Keychain/Keystore；HTTPS 与证书校验、
   敏感日志脱敏；权限最小化与输入校验

## 技术选型

- **VitePress 1.6.4**（稳定版）。2.0 目前只到 `alpha.19`（2026-08-02 发布），
  一本要维护数月的书不应坐在 alpha 上。2.0 正式版发布后单独评估升级。
- **vitepress-sidebar 1.39.0**（2026-08-18 发布，活跃维护）。该包未把 vitepress 声明为
  peerDependency，耦合度低。
- **npm** 作为包管理器。VitePress 官方部署文档的 workflow 按 npm 编写，可少一个
  `pnpm/action-setup` 步骤；文档站依赖量小，安装速度差异可忽略。
- 配置文件用 TypeScript（`config.ts`）。

### 已实测确认的事实

以下为本次设计中核实过的技术前提，记录来源避免后续重复推导或误判：

- **Shiki 内置语言**：`@shikijs/langs` 4.4.3 共 360 种语言，`dart`、`kotlin`、`swift`、
  `java`、`xml`、`json`、`yaml`、`bash`、`typescript`、`groovy` **均已内置**。
  验证方式：直接查询 npm registry 的 `exports` 字段。
- **VitePress 无语言白名单**：1.6.4 不存在 `markdown.languages` 配置项，Shiki 内置语言
  自动可用，代码高亮零额外配置。`markdown.*` 可用子项为 `theme`、`lineNumbers`、
  `math`、`headers`。
- **Shiki 没有 `gradle` 语言**：Gradle 构建脚本需标 `groovy`（`build.gradle`）或
  `kotlin`（`build.gradle.kts`）。`objectivec` 同样不在内置列表中（本书用 Swift，不涉及）。
- **图片相对路径自动处理 base**：Markdown 中的相对路径图片由 Vite 资源管线处理，
  会自动加上 `base` 前缀；`public/` 下的绝对路径也可用；`{{ $withBase() }}` 仅用于
  动态路径。来源：VitePress asset-handling 文档。
- **vitepress-sidebar 关键选项**：`sortMenusByFrontmatterOrder`、
  `frontmatterOrderDefaultValue`（默认 0）、`useTitleFromFrontmatter`（默认 false）、
  `useFolderTitleFromIndexFile`（默认 false）、`useFolderLinkFromIndexFile`（默认 false）、
  `sortFolderTo`（默认 null）、`excludeByGlobPattern`、`collapsed`（默认 false）、
  `collapseDepth`（默认 2）。支持按路径前缀生成多个侧边栏。

### 刻意规避的不确定性

`vitepress-sidebar` 对**嵌套文件夹**的排序与标题机制，官方文档说明不够明确
（`sortMenusByFrontmatterOrder` 是否作用于文件夹无法从文档确证）。本设计通过
**五大块内部保持扁平、不嵌套子目录**来让该不确定性不影响结果——文件级 `order`
是文档明确支持的。

按用户列出的子项估算，每块约 6–11 篇，扁平结构完全够用。**触发引入嵌套的阈值：
单块章节数超过约 20 篇**。届时应有真实内容可用来校准分组方式，而不是现在凭猜测预建层级。

## 目录结构

```
Learning_mobile_app/
├─ .github/workflows/deploy.yml
├─ .gitignore
├─ package.json
├─ README.md                 # 仓库说明与本地写作指引，不属于书稿
├─ specs/                    # 项目元文档（设计、实现计划），不属于书稿
└─ docs/                     # VitePress srcDir，即书稿
   ├─ .vitepress/
   │  ├─ config.ts
   │  ├─ cache/              # gitignore
   │  └─ dist/               # gitignore
   ├─ public/                # 仅 favicon、CNAME 等必须保留原名的文件
   ├─ index.md               # 首页，hero 布局
   ├─ 01-fundamentals/       # 基础
   │  └─ index.md
   ├─ 02-client/             # 客户端开发
   │  └─ index.md
   ├─ 03-engineering/        # 工程化
   │  └─ index.md
   ├─ 04-testing/            # 测试
   │  └─ index.md
   └─ 05-security/           # 安全
      └─ index.md
```

**`.gitignore` 需包含**：`node_modules/`、`docs/.vitepress/cache/`、
`docs/.vitepress/dist/`。目录树中标注 gitignore 的两项即指此。

`specs/` 与 `docs/` 物理隔离：默认约定是把设计文档放在 `docs/superpowers/specs/`，
但 `docs/` 正是 VitePress 的 srcDir，放进去会被当作书页构建进站点。

## 命名与写作约定

**目录名**：英文 slug + 两位数字前缀（`01-fundamentals`）。5 个目录固定不变，
前缀让文件系统和 URL 中的阅读顺序一目了然。

**文件名**：英文 kebab-case（`async-programming.md`）。中文标题写在 frontmatter。
理由：URL 需要可分享，中文路径会编码成 `%E5%9F%BA%E7%A1%80` 这类不可读形式。

**frontmatter 约定**：

```yaml
---
title: 异步编程
order: 20
---
```

- `order` 用 **10 的间隔**（10、20、30…），在两篇之间插入新章节时不需要重排后续文件。
- 侧边栏标题取自 `title`（`useTitleFromFrontmatter: true`）。
- 排序由 `sortMenusByFrontmatterOrder: true` 驱动。

**图片约定**：与引用它的章节同目录存放，用相对路径引用。

下面示例展示的是**将来新增章节后**的目录形态，不是本次骨架的初始状态
（初始状态每个块目录下只有一个 `index.md`）：

```
01-fundamentals/
├─ index.md
├─ async-programming.md
└─ async-programming/
   └─ event-loop.png
```

```markdown
![](./async-programming/event-loop.png)
```

`public/` 只放必须保留原始文件名的资源（favicon、CNAME、robots.txt）。
移动端书截图量大，而 GitHub Pages 项目页存在 base 前缀，
把内容图片放进 `public/` 再用绝对路径引用是整站图片 404 的常见来源，故明确规避。

**代码示例**：多语言对照使用 VitePress 的 code group，把同一件事的
Dart / Kotlin / Swift 三种写法做成并排 tab。该特性契合「跨平台优先 + 原生补充」的结构。

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
Gradle 脚本按上文标注为 `groovy` 或 `kotlin`。

**块首页（`index.md`）**：每个块的首页写入该块的规划清单，条目来自用户列出的子项，
以 checkbox 形式呈现，写完一篇勾掉一篇。这样路线图可见，但不会在站内搜索里
混入大量空页。章节文件本身**随写随建**——因为侧边栏自动生成，新建文件即自动出现，
无需改配置。

## 首页

`docs/index.md` 用 VitePress 的 `layout: hero`，内容保持克制：

- **hero**：书名 + 一句话副标题，说明这是一本按主题组织的移动端开发学习笔记
- **features 卡片**：五张，分别指向五大块的 `index.md`，卡片文案用该块的一句话定位
- **actions 按钮**：「开始阅读」指向 `01-fundamentals/`，「GitHub」指向仓库

不放访问统计、不放最近更新列表。

## 导航

- **`nav`（顶部）手写**：首页 + 五大块 + GitHub 仓库链接。这部分稳定不变，
  手写换来零依赖和完全可控。
- **`sidebar`（左侧）自动生成**：按 5 个路径前缀分别生成，使「测试」块内只显示
  测试章节，不混入其他四块。
- **块首页在自身侧边栏中的位置**：每个块的 `index.md` 作为该块侧边栏的第一项，
  frontmatter 设 `order: 1`、`title: 概览`，让规划清单随时可达。
  该行为需在实现阶段实测确认（插件是否把 sidebar 根目录的 `index.md` 纳入列表）。
- **折叠类选项不适用**：`collapsed` 与 `collapseDepth` 只对嵌套文件夹生效，
  本设计五大块内部扁平，故不配置这两项。此处记录是为了避免后续有人看到选项
  列表却找不到对应配置时产生困惑。

## 部署

- `base: '/Learning_mobile_app/'`（项目页，非用户页，必须配置，否则资源 404）。
- GitHub Actions workflow 采用官方 `actions/deploy-pages` 模式。
- 最终地址：`https://erick785.github.io/Learning_mobile_app/`

### 需要用户手动完成的一步

仓库 **Settings → Pages → Source 需改为 "GitHub Actions"**。这属于 GitHub 仓库设置，
不在 git 操作可触达的范围内，实现阶段不会代为修改仓库配置。未做这一步的话
workflow 会成功但站点不会更新。

## 验证标准

文档站的「测试」即以下各项：

1. `npm run docs:build` 通过，无错误。
2. **不设置 `ignoreDeadLinks`**。VitePress 默认对死链报错，对一本书而言这是应当保留的
   保护机制，不用配置项把它关掉。
3. `npm run docs:preview` 起本地服务后在浏览器实测（preview 会带 base 路径，
   这是推送前唯一能抓出 base 配错的手段）：
   - 五大块导航可点，链接不带 base 时也能正确跳转
   - 每块侧边栏独立，不串块
   - 块首页规划清单正常渲染
   - 首页 hero 布局正常
   - 站内搜索有结果
   - 暗色模式切换正常
4. 首次推送后访问真实地址，确认无资源 404（重点看 base 路径是否生效）。

## 范围外（YAGNI）

明确不在本次实现范围内：

- EPUB / PDF / MOBI 导出。正文是纯 Markdown，将来需要时可无改造接 Pandoc，
  但本次不引入。
- 自定义主题、自定义 Vue 组件。用 VitePress 默认主题。
- 嵌套子目录（见上文阈值说明）。
- 全部 ~45 个子章节的占位文件（骨架粒度已定为方案 c）。
- 五大块下的**章节正文**。章节内容是用户的学习成果，不代写。
  注意：首页文案与各块 `index.md` 的规划清单**属于骨架范围**，会写；
  清单条目直接来自用户已列出的子项，不是代写的学习内容。
- 评论系统、访问统计、多语言 i18n。
