# 移动端学习电子书骨架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭出一个可部署到 GitHub Pages 的 VitePress 电子书空骨架，五大块导航与自动侧边栏就位，写作约定成文，但不写任何章节正文。

**Architecture:** VitePress 默认主题，`docs/` 为 srcDir，五个平级子目录对应五大块、块内扁平不嵌套。顶部 `nav` 手写，左侧 `sidebar` 由 `vitepress-sidebar` 按路径前缀自动生成并按 frontmatter `order` 排序。站点部署在 GitHub Pages 项目页，因此 `base` 必须为 `/Learning_mobile_app/`。

**Tech Stack:** VitePress 1.6.4、vitepress-sidebar 1.39.0、Node 24（CI）/ TypeScript 配置、npm、GitHub Actions。

**设计依据:** `specs/2026-09-03-mobile-learning-ebook-design.md`（commit `65c451d`）。本计划中所有技术前提均已核实，来源记录在设计文档「已实测确认的事实」一节。

---

## 交付前提（不是任务项）

以下步骤只能由仓库所有者在 GitHub 网页上完成，git 操作触达不到，**本计划不包含也不会代为执行**：

- 仓库 **Settings → Pages → Build and deployment → Source** 改为 **GitHub Actions**
- 未做这一步时 Task 10 的 workflow 会构建成功但站点不发布，且不报错，容易误判为已完成

另一项由用户自行处理、与本计划无关：仓库尚无 git 身份配置，当前 commit 作者是主机名推导的
`erick <erick@erickdeMacBook-Pro.local>`。公开仓库需用户自行 `git config --global user.name/user.email`
并 `git commit --amend --reset-author`。**实现者不得修改 git config。**

## 已知的提纲歧义（实现者不要自行修正）

用户提供的提纲里「状态管理」同时出现在第 2 块（客户端开发，指 Flutter 状态管理）和第 3 块
（工程化，指架构层面的状态管理）。块首页清单按用户原文各自保留，**不要合并、不要去重、
不要加注释说明**。这属于内容决策，由用户在写正文时自行处理。

## 文件结构

| 文件 | 职责 |
| --- | --- |
| `package.json` | 依赖（精确锁版本）与三个 npm script |
| `.gitignore` | 排除 node_modules 与 VitePress 构建产物 |
| `README.md` | 仓库说明与写作指引，**不属于书稿** |
| `docs/.vitepress/config.ts` | 站点全部配置：base、nav、自动 sidebar、中文搜索、i18n 文案 |
| `docs/index.md` | 首页，hero 布局 + 五张 feature 卡 |
| `docs/public/favicon.svg` | 站点图标，`public/` 目前仅此一项 |
| `docs/01-fundamentals/index.md` | 基础 — 块首页与规划清单 |
| `docs/02-client/index.md` | 客户端开发 — 块首页与规划清单 |
| `docs/03-engineering/index.md` | 工程化 — 块首页与规划清单 |
| `docs/04-testing/index.md` | 测试 — 块首页与规划清单 |
| `docs/05-security/index.md` | 安全 — 块首页与规划清单 |
| `.github/workflows/deploy.yml` | 推 main 自动构建并发布到 GitHub Pages |

`specs/` 已存在且刻意留在 `docs/` 之外：`docs/` 是 VitePress srcDir，元文档放进去会被构建成书页。

**明确不创建的文件：** 五大块下的任何章节 `.md`（约 45 个占位文件）。侧边栏自动生成，章节随写随出现。

---

### Task 1: 初始化项目与依赖

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 `package.json`**

依赖用精确版本（不带 `^`）。理由：这是一本要维护数月的书，设计阶段已明确选定 1.6.4 而非「最新 1.x」，浮动版本会让构建结果随时间漂移。

```json
{
  "name": "learning-mobile-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "移动端开发学习笔记电子书",
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "vitepress": "1.6.4",
    "vitepress-sidebar": "1.39.0"
  }
}
```

- [ ] **Step 2: 创建 `.gitignore`**

```
node_modules/
docs/.vitepress/cache/
docs/.vitepress/dist/
*.log
.DS_Store
```

- [ ] **Step 3: 安装依赖**

Run: `npm install`
Expected: 生成 `package-lock.json` 与 `node_modules/`，退出码 0，无 `ERESOLVE` 冲突。
`vitepress-sidebar` 会带入 `glob` 作为传递依赖，属正常。

- [ ] **Step 4: 验证装到的是精确版本**

Run: `npx vitepress --version && node -p "require('vitepress-sidebar/package.json').version"`
Expected: 两行输出分别为 `1.6.4` 和 `1.39.0`

若输出带 `^` 解析后的更高版本，说明 Step 1 的 package.json 写错了，回到 Step 1 修正后重装。

- [ ] **Step 5: 验证 gitignore 生效**

Run: `git status --short`
Expected: 只看到 `package.json`、`package-lock.json`、`.gitignore`，**不出现** `node_modules/`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: 初始化 VitePress 电子书项目依赖

锁定 vitepress 1.6.4 与 vitepress-sidebar 1.39.0 精确版本，避免构建结果随时间漂移。"
```

---

### Task 2: 站点基础配置与首次构建

**Files:**
- Create: `docs/.vitepress/config.ts`
- Create: `docs/index.md`

本任务只建立最小可构建配置，sidebar 在 Task 4 接入，首页 hero 在 Task 7 替换。

- [ ] **Step 1: 创建占位首页 `docs/index.md`**

```markdown
---
title: 首页
---

# 移动端开发学习笔记

骨架搭建中。
```

- [ ] **Step 2: 创建 `docs/.vitepress/config.ts`**

`base` 必须是 `/Learning_mobile_app/`（含首尾斜杠）。这是 GitHub Pages **项目页**而非用户页，仓库名会成为 URL 路径的一段；漏配会导致 CSS/JS 全部 404、页面白屏。

```ts
import { defineConfig } from 'vitepress'

const base = '/Learning_mobile_app/'

const parts = [
  { dir: '01-fundamentals', title: '基础' },
  { dir: '02-client', title: '客户端开发' },
  { dir: '03-engineering', title: '工程化' },
  { dir: '04-testing', title: '测试' },
  { dir: '05-security', title: '安全' },
]

export default defineConfig({
  base,
  lang: 'zh-CN',
  title: '移动端开发学习笔记',
  description: '按主题组织的移动端开发手册：基础、客户端开发、工程化、测试、安全',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      ...parts.map((p) => ({ text: p.title, link: `/${p.dir}/` })),
      {
        text: 'GitHub',
        link: 'https://github.com/erick785/Learning_mobile_app',
      },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '更新于' },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
  },
})
```

**刻意不设置的项，不要加：**

- `cleanUrls: true` — GitHub Pages 不为 `foo.html` 提供 `/foo` 的无扩展名路由，开了会全站 404
- `ignoreDeadLinks` — VitePress 默认对死链报错，这是本书要保留的保护，Task 6 会实测它确实生效

- [ ] **Step 3: 构建**

Run: `npm run docs:build`
Expected: 退出码 0，输出 `build complete`，生成 `docs/.vitepress/dist/`

- [ ] **Step 4: 验证 base 已注入产物**

Run: `grep -o '/Learning_mobile_app/assets/[^"]*\.css' docs/.vitepress/dist/index.html | head -1`
Expected: 输出一条形如 `/Learning_mobile_app/assets/style.xxxx.css` 的路径

若输出为空或路径不含 `/Learning_mobile_app/` 前缀，说明 `base` 没生效——检查 Step 2 中 `base` 是否写在 `defineConfig` 顶层（不是 `themeConfig` 里）。

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/config.ts docs/index.md
git commit -m "feat: 添加 VitePress 站点基础配置

设置 GitHub Pages 项目页所需的 base 路径、中文界面文案与本地搜索。
刻意不开 cleanUrls（Pages 不支持无扩展名路由）、不设 ignoreDeadLinks（保留死链保护）。"
```

---

### Task 3: 五大块目录与块首页

**Files:**
- Create: `docs/01-fundamentals/index.md`
- Create: `docs/02-client/index.md`
- Create: `docs/03-engineering/index.md`
- Create: `docs/04-testing/index.md`
- Create: `docs/05-security/index.md`

每个块首页 frontmatter 统一为 `title: 概览`、`order: 1`，使其排在自身侧边栏首位。清单条目来自用户提供的提纲原文。

- [ ] **Step 1: 创建 `docs/01-fundamentals/index.md`**

```markdown
---
title: 概览
order: 1
---

# 基础

不绑定具体平台的通用基础。Dart、Kotlin、Swift 三门语言的语法特性分开记。

## 规划

- [ ] Dart（Flutter）
- [ ] Kotlin（Android）
- [ ] Swift（iOS）
- [ ] Git
- [ ] 命令行
- [ ] HTTP / JSON
- [ ] REST API
- [ ] 数据结构
- [ ] 异步编程
- [ ] 网络与安全基础
```

- [ ] **Step 2: 创建 `docs/02-client/index.md`**

```markdown
---
title: 概览
order: 1
---

# 客户端开发

跨平台优先 Flutter，原生作为补充。

## 规划

### Flutter

- [ ] UI
- [ ] 状态管理
- [ ] 路由
- [ ] 动画
- [ ] 插件

### 原生补充

- [ ] Android：Kotlin / Jetpack
- [ ] iOS：Swift / SwiftUI

### 系统能力

- [ ] 本地存储
- [ ] 登录鉴权
- [ ] 推送通知
- [ ] 文件 / 相机 / 定位
```

- [ ] **Step 3: 创建 `docs/03-engineering/index.md`**

```markdown
---
title: 概览
order: 1
---

# 工程化

从代码组织到发布上线。

## 规划

- [ ] 分层架构
- [ ] 状态管理
- [ ] 错误处理
- [ ] 日志
- [ ] 依赖管理
- [ ] 环境配置
- [ ] 打包签名
- [ ] 发布到应用商店
- [ ] CI/CD：自动构建、测试、发布
```

- [ ] **Step 4: 创建 `docs/04-testing/index.md`**

```markdown
---
title: 概览
order: 1
---

# 测试

## 规划

### 按层级

- [ ] 单元测试：业务逻辑、数据转换
- [ ] Widget / UI 测试：页面组件与交互
- [ ] 集成测试：登录、支付、交易等完整流程

### 按环境

- [ ] 真机 / 模拟器：Android Emulator、iOS Simulator

### 专项

- [ ] 接口测试
- [ ] 弱网测试
- [ ] 兼容性测试
- [ ] 性能测试
- [ ] 崩溃监控
```

- [ ] **Step 5: 创建 `docs/05-security/index.md`**

```markdown
---
title: 概览
order: 1
---

# 安全

## 规划

- [ ] 不明文保存 token、密码、私钥
- [ ] Keychain / Keystore 等安全存储
- [ ] HTTPS 与证书校验
- [ ] 敏感日志脱敏
- [ ] 权限最小化
- [ ] 输入校验
```

- [ ] **Step 6: 构建验证五个页面都能生成**

Run: `npm run docs:build`
Expected: 退出码 0

Run: `ls docs/.vitepress/dist/01-fundamentals docs/.vitepress/dist/05-security`
Expected: 两个目录都存在且各含 `index.html`

- [ ] **Step 7: Commit**

```bash
git add docs/01-fundamentals docs/02-client docs/03-engineering docs/04-testing docs/05-security
git commit -m "feat: 添加五大块目录与块首页规划清单

基础/客户端开发/工程化/测试/安全各一个 index.md，frontmatter 统一 order:1、
title:概览。清单条目为学习提纲，写完一篇勾掉一篇，章节文件随写随建。"
```

---

### Task 4: 接入自动侧边栏

**Files:**
- Modify: `docs/.vitepress/config.ts`

已核实的 API 事实（`vitepress-sidebar@1.39.0` 的 `dist/index.d.ts`）：

- 导出 `generateSidebar` 与 `withSidebar`；`generateSidebar` 接受**单个选项对象或选项数组**，传数组时返回 VitePress 的多侧边栏结构（按 `basePath` 分组）
- 关键默认值：`documentRootPath: '/'`、`includeRootIndexFile: false`、`useTitleFromFrontmatter: false`、`sortMenusByFrontmatterOrder: false`、`frontmatterOrderDefaultValue: 0`、`frontmatterTitleFieldName: 'title'`、`debugPrint: false`
- `includeRootIndexFile` 默认 `false`，**必须显式设为 `true`**，否则块首页不会出现在自己的侧边栏里

- [ ] **Step 1: 在 config.ts 顶部加入导入与 sidebar 生成**

把 Task 2 中 `import { defineConfig } from 'vitepress'` 一行替换为：

```ts
import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
```

在 `const parts = [...]` 定义之后、`export default defineConfig({` 之前插入：

```ts
// debugPrint 仅在 Task 4/5 验证期间开启，Task 5 结束时必须改回 false
const sidebarDebug = true

const sidebar = generateSidebar(
  parts.map((p) => ({
    documentRootPath: '/docs',
    scanStartPath: p.dir,
    basePath: `/${p.dir}/`,
    includeRootIndexFile: true,
    useTitleFromFrontmatter: true,
    frontmatterTitleFieldName: 'title',
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 0,
    excludeByGlobPattern: ['**/README.md'],
    debugPrint: sidebarDebug,
  })),
)
```

- [ ] **Step 2: 把 sidebar 挂到 themeConfig**

在 `themeConfig` 对象内，`search: { provider: 'local' },` 之前插入一行：

```ts
    sidebar,
```

- [ ] **Step 3: 构建并查看插件打印的实际结构**

Run: `npm run docs:build 2>&1 | head -80`
Expected: 退出码 0，且 stderr/stdout 中出现 `[vitepress-sidebar]` 打印的侧边栏对象。

检查打印内容，确认三点：

1. 有 5 个顶层 key，分别为 `/01-fundamentals/`、`/02-client/`、`/03-engineering/`、`/04-testing/`、`/05-security/`
2. 每个 key 下的 `items` 第一项 `text` 为 `概览`（说明 `includeRootIndexFile` + `useTitleFromFrontmatter` 生效）
3. `link` 形如 `/01-fundamentals/` 而非 `01-fundamentals/index.html` 或缺少前导斜杠

**若第 2 点不成立**（`items` 为空或缺少「概览」）：说明 `includeRootIndexFile` 未生效，检查 Step 1 是否漏写该项。这是设计阶段标记的不确定点，此处即为实测。

**若第 3 点中 link 缺少 `/` 前缀或重复了目录名**：调整 `resolvePath` 选项，或改用 `basePath` 与 `scanStartPath` 的组合重试。记录最终可用组合到本计划末尾的「实现期发现」。

- [ ] **Step 4: 浏览器验证侧边栏不串块**

Run: `npm run docs:dev`
在浏览器打开终端输出的地址（默认 `http://localhost:5173/Learning_mobile_app/`）。

依次点击顶部导航五大块，确认：

- 每块左侧侧边栏只显示本块内容，不出现其他四块的章节
- 侧边栏第一项是「概览」且可点
- 块首页的规划清单 checkbox 正常渲染

Run: 验证完毕后在终端按 `Ctrl+C` 停止 dev server

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/config.ts
git commit -m "feat: 接入自动生成的分块侧边栏

用 generateSidebar 传入选项数组，按路径前缀为五大块各生成一个侧边栏。
显式开启 includeRootIndexFile（默认 false）让块首页进入自身侧边栏首位，
排序由 frontmatter order 驱动，故新增章节无需改配置。"
```

---

### Task 5: 实测 frontmatter order 排序生效

**Files:**
- Create（临时，本任务结束时删除）: `docs/01-fundamentals/aaa-second.md`
- Create（临时，本任务结束时删除）: `docs/01-fundamentals/zzz-first.md`
- Modify: `docs/.vitepress/config.ts`

这是写作约定的地基：全书靠 `order: 10/20/30` 排序。若插件实际按文件名排序，整套约定就是错的，必须现在验出。用文件名字母序与 frontmatter order **故意相反**来构造红→绿。

- [ ] **Step 1: 写两个排序相反的观察文件（红）**

创建 `docs/01-fundamentals/aaa-second.md`：

```markdown
---
title: 排序验证乙
order: 20
---

# 排序验证乙

临时文件，用于验证侧边栏排序，验证后删除。
```

创建 `docs/01-fundamentals/zzz-first.md`：

```markdown
---
title: 排序验证甲
order: 10
---

# 排序验证甲

临时文件，用于验证侧边栏排序，验证后删除。
```

- [ ] **Step 2: 临时关闭 order 排序，确认默认行为确实错误**

把 config.ts 中的 `sortMenusByFrontmatterOrder: true,` 改为 `sortMenusByFrontmatterOrder: false,`

Run: `npm run docs:build 2>&1 | grep -A3 '排序验证'`
Expected: 「排序验证乙」（`aaa-`）出现在「排序验证甲」（`zzz-`）**之前** —— 即按文件名字母序，而非 order

这证明红：不加该选项时排序不符合我们的约定。

- [ ] **Step 3: 恢复 order 排序，确认修正（绿）**

把 `sortMenusByFrontmatterOrder: false,` 改回 `sortMenusByFrontmatterOrder: true,`

Run: `npm run docs:build 2>&1 | grep -A3 '排序验证'`
Expected: 「排序验证甲」（order 10）出现在「排序验证乙」（order 20）**之前**，与文件名字母序相反

同时确认「概览」（order 1）仍在最前。

- [ ] **Step 4: 关闭 debugPrint**

把 config.ts 中的 `const sidebarDebug = true` 改为 `const sidebarDebug = false`

Run: `npm run docs:build 2>&1 | grep -c 'vitepress-sidebar'`
Expected: `0`

- [ ] **Step 5: 删除临时文件并确认干净**

Run: `rm docs/01-fundamentals/aaa-second.md docs/01-fundamentals/zzz-first.md && npm run docs:build`
Expected: 退出码 0

Run: `git status --short`
Expected: 只有 `docs/.vitepress/config.ts` 被修改（`debugPrint` 那一行），**没有**残留的临时 md 文件

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/config.ts
git commit -m "chore: 关闭侧边栏 debugPrint

已实测确认 sortMenusByFrontmatterOrder 生效：order 10 的章节排在 order 20 之前，
与文件名字母序无关。写作约定（order 用 10 的间隔）成立。"
```

---

### Task 6: 实测死链保护生效

**Files:**
- Modify（临时，本任务结束时还原）: `docs/01-fundamentals/index.md`

设计决定不设置 `ignoreDeadLinks`。本任务验证这个保护**确实处于武装状态**——否则「不设该选项」只是意图而非事实。

- [ ] **Step 1: 注入一个死链（红）**

在 `docs/01-fundamentals/index.md` 末尾追加一行：

```markdown

[这是一个不存在的链接](./does-not-exist.md)
```

- [ ] **Step 2: 确认构建失败**

Run: `npm run docs:build`
Expected: **退出码非 0**，报错信息包含 `dead link` 与 `./does-not-exist.md`

若构建反而成功了，说明死链检测未生效，需检查 config.ts 是否被误加了 `ignoreDeadLinks`。停下来排查，不要继续。

- [ ] **Step 3: 还原文件（绿）**

Run: `git checkout -- docs/01-fundamentals/index.md`

- [ ] **Step 4: 确认构建恢复**

Run: `npm run docs:build && git status --short`
Expected: 构建退出码 0；`git status` 无输出（工作树干净，Task 5 的改动已提交）

本任务不产生 commit——它是验证，不改动产物。

---

### Task 7: 首页 hero

**Files:**
- Modify: `docs/index.md`

替换 Task 2 的占位内容。链接写在 frontmatter 里，VitePress 会对 hero actions 与 features 的 `link` 应用 base，但**这一点需在 Step 3 实测确认**。

- [ ] **Step 1: 覆写 `docs/index.md`**

```markdown
---
layout: home

hero:
  name: 移动端开发学习笔记
  text: 按主题组织的手册
  tagline: 基础 · 客户端开发 · 工程化 · 测试 · 安全
  actions:
    - theme: brand
      text: 开始阅读
      link: /01-fundamentals/
    - theme: alt
      text: GitHub
      link: https://github.com/erick785/Learning_mobile_app

features:
  - title: 基础
    details: Dart / Kotlin / Swift 三门语言，Git、命令行、HTTP 与 JSON、REST API、数据结构、异步编程、网络与安全基础。
    link: /01-fundamentals/
    linkText: 进入
  - title: 客户端开发
    details: Flutter 为主（UI、状态管理、路由、动画、插件），Android Kotlin/Jetpack 与 iOS Swift/SwiftUI 为补充；本地存储、登录鉴权、推送通知与系统能力。
    link: /02-client/
    linkText: 进入
  - title: 工程化
    details: 分层架构、状态管理、错误处理、日志；依赖管理、环境配置、打包签名、应用商店发布；CI/CD 自动构建与发布。
    link: /03-engineering/
    linkText: 进入
  - title: 测试
    details: 单元 / Widget / 集成测试，真机与模拟器；接口、弱网、兼容性、性能测试与崩溃监控。
    link: /04-testing/
    linkText: 进入
  - title: 安全
    details: token 与密钥不落明文，Keychain / Keystore 安全存储，HTTPS 与证书校验，日志脱敏，权限最小化与输入校验。
    link: /05-security/
    linkText: 进入
---
```

- [ ] **Step 2: 构建**

Run: `npm run docs:build`
Expected: 退出码 0，无死链报错（若 features 的 link 被当作死链检测，说明路径写法需调整）

- [ ] **Step 3: 实测 hero 链接在 base 下可点**

Run: `npm run docs:preview`
在浏览器打开终端输出的地址（默认 `http://localhost:4173/Learning_mobile_app/`）。

确认：

- 首页是 hero 布局，五张 feature 卡片排布正常
- 点「开始阅读」跳到 `/Learning_mobile_app/01-fundamentals/`，**不是** 404
- 点任意 feature 卡的「进入」能跳到对应块
- 右上角「GitHub」开新标签到仓库

Run: 验证完毕后 `Ctrl+C` 停止 preview

若跳转到不含 `/Learning_mobile_app/` 的地址而 404，说明 frontmatter 里的 link 未被 base 处理，改用 `{{ $withBase() }}` 不可行于 frontmatter，此时把 link 写成完整路径 `/Learning_mobile_app/01-fundamentals/`，并在「实现期发现」中记录。

- [ ] **Step 4: Commit**

```bash
git add docs/index.md
git commit -m "feat: 首页改为 hero 布局并列出五大块入口

五张 feature 卡分别指向五大块首页，文案用各块的一句话定位。"
```

---

### Task 8: favicon 与 public 目录

**Files:**
- Create: `docs/public/favicon.svg`

`public/` 只放必须保留原始文件名的资源。内容图片**不放这里**——按约定与章节同目录、用相对路径引用，由 Vite 资源管线自动处理 base（已核实）。

- [ ] **Step 1: 创建 `docs/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2f3542"/><rect x="11" y="5" width="10" height="22" rx="2.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="16" cy="23" r="1.2" fill="#fff"/></svg>
```

- [ ] **Step 2: 构建并验证产物路径带 base**

Run: `npm run docs:build && ls docs/.vitepress/dist/favicon.svg`
Expected: 文件存在

Run: `grep -o 'href="[^"]*favicon.svg"' docs/.vitepress/dist/index.html`
Expected: `href="/Learning_mobile_app/favicon.svg"`

若输出为 `href="/favicon.svg"`（缺 base 前缀），说明 config.ts 的 `head` 没用上 `base` 变量，检查 Task 2 Step 2 中 href 是否为模板字符串 `${base}favicon.svg`。

- [ ] **Step 3: Commit**

```bash
git add docs/public/favicon.svg
git commit -m "feat: 添加站点 favicon

放在 public/ 下以保留原始文件名，head 中用 base 变量拼接路径避免项目页 404。"
```

---

### Task 9: 中文本地搜索验证

**Files:**
- Modify（仅在验证失败时）: `docs/.vitepress/config.ts`

VitePress 本地搜索基于 minisearch，默认按空白分词。本书是中文、无空格分词，**默认配置可能搜不到中文内容**。这是设计阶段未覆盖的真实风险，必须先验后改。

- [ ] **Step 1: 起 preview 并实测中文搜索**

Run: `npm run docs:preview`
在浏览器打开首页，点击顶部搜索框（或按 `Ctrl/Cmd+K`）。

依次搜索以下三个词，记录每个是否有结果：

- `异步编程`（存在于块首页清单）
- `Keychain`（英文词，作为对照组）
- `安全`

Run: `Ctrl+C` 停止 preview

- [ ] **Step 2: 若中文搜索有结果，直接提交说明并结束本任务**

无需改配置。跳到 Step 4。

- [ ] **Step 3: 若中文搜索无结果，改为按字切分的 tokenizer**

把 config.ts 中 `search: { provider: 'local' },` 替换为：

```ts
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          tokenize: (text: string) =>
            text
              .replace(/[\u3400-\u9fff]/g, (c) => ` ${c} `)
              .split(/\s+/)
              .filter(Boolean),
          searchOptions: {
            tokenize: (query: string) =>
              query
                .replace(/[\u3400-\u9fff]/g, (c) => ` ${c} `)
                .split(/\s+/)
                .filter(Boolean),
          },
        },
      },
    },
```

Run: `npm run docs:build && npm run docs:preview`
重新执行 Step 1 的三个搜索，Expected: `异步编程`、`安全` 均返回块首页结果。

Run: `Ctrl+C` 停止 preview

按字切分会让单字查询命中过多噪音，这是已知取舍：优先保证搜得到，而非搜得准。若结果噪音过大，在「实现期发现」记录，由用户决定是否换 Algolia（需外部账号，属新的跨系统依赖）。

- [ ] **Step 4: Commit**

若 Step 3 改了配置：

```bash
git add docs/.vitepress/config.ts
git commit -m "fix: 本地搜索改用按字切分以支持中文

minisearch 默认按空白分词，中文无空格导致搜不到内容。
取舍：单字查询噪音变大，优先保证搜得到。"
```

若 Step 2 判定无需修改：本任务不产生 commit，在最终报告中说明中文搜索默认可用。

---

### Task 10: README 写作指引

**Files:**
- Create: `README.md`

这是给「几个月后回来续写的用户」看的，不是给访客看的。重点是**怎么加一章而不碰配置**。

- [ ] **Step 1: 创建 `README.md`**

`````markdown
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

   侧边栏显示的是 `title`，不是文件名。

3. 回到该块的 `index.md`，把规划清单里对应那条勾掉并加上链接：

   ```markdown
   - [x] [异步编程](./async-programming.md)
   ```

4. `npm run docs:dev` 确认侧边栏位置正确，然后提交。

## 图片

与章节同目录建一个与章节同名的子文件夹，用**相对路径**引用：

```
docs/01-fundamentals/
├─ async-programming.md
└─ async-programming/
   └─ event-loop.png
```

```markdown
![](./async-programming/event-loop.png)
```

相对路径由 Vite 资源管线处理，会自动加 base 前缀。
**不要**把内容图片放进 `docs/public/` 再用绝对路径引用——GitHub Pages 项目页
有 base 前缀，那样写会整站图片 404。`public/` 只放必须保留原始文件名的资源
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
├─ specs/                         设计文档与实现计划
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

## 部署

推送到 `main` 即自动构建发布，workflow 见 `.github/workflows/deploy.yml`。

**首次部署前必须手动做一次**：仓库 Settings → Pages → Build and deployment →
Source 选 **GitHub Actions**。这一步不在 git 可触达范围内，没做的话 workflow
会成功但站点不更新，且不报错。

## 依赖版本

`vitepress` 与 `vitepress-sidebar` 都锁精确版本（不带 `^`），升级需显式改
`package.json` 并重新验证。刻意不用 VitePress 2.0（目前仅 alpha）。
`````

- [ ] **Step 2: 验证 README 不被构建成书页**

Run: `npm run docs:build && ls docs/.vitepress/dist/ | grep -i readme`
Expected: 无输出（README 在仓库根、不在 `docs/` 下，本就不会被收录）

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: 添加仓库说明与写作指引

重点写清怎么加一章而无需改配置、图片为何用相对路径而非 public/、
以及 Gradle 脚本的语言标注坑。"
```

---

### Task 11: GitHub Actions 部署 workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

Action 主版本号已核实为当前最新（2026-09-03）：`checkout@v7`、`setup-node@v7`、
`configure-pages@v6`、`upload-pages-artifact@v5`、`deploy-pages@v5`。
VitePress 官方文档示例中的版本号偏旧，此处以实测为准。

- [ ] **Step 1: 创建 `.github/workflows/deploy.yml`**

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
        with:
          # lastUpdated 需要完整 git 历史来计算每页的最后修改时间
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v6

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

`fetch-depth: 0` 是必需的：config.ts 开了 `lastUpdated`，浅克隆会让每页的
「更新于」显示为构建时间而非真实提交时间。

- [ ] **Step 2: 验证 YAML 语法**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/deploy.yml','utf8');console.log('lines:',s.split('\n').length);console.log('has deploy job:',/^\s{2}deploy:/m.test(s));console.log('has build job:',/^\s{2}build:/m.test(s));"`
Expected: 三行输出，`has deploy job: true`、`has build job: true`

- [ ] **Step 3: 本地预演 CI 的关键命令**

CI 用 `npm ci`，它要求 `package-lock.json` 与 `package.json` 严格一致。本地先验一次，避免推到 CI 才发现锁文件不同步。

Run: `rm -rf node_modules && npm ci && npm run docs:build`
Expected: `npm ci` 退出码 0（无 `EUSAGE` 锁文件不一致报错），构建退出码 0

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: 添加 GitHub Pages 部署 workflow

推送 main 自动构建发布。fetch-depth 设为 0 以支持 lastUpdated 取真实提交时间。
action 主版本按 2026-09-03 实测最新版固定。"
```

---

### Task 12: 全量验收

**Files:** 无新增，仅验证

- [ ] **Step 1: 干净构建**

Run: `rm -rf docs/.vitepress/dist docs/.vitepress/cache && npm run docs:build`
Expected: 退出码 0，输出 `build complete`，无死链警告

- [ ] **Step 2: 用 preview 验证 base 路径（不是 serve dist）**

Run: `npm run docs:preview`
Expected: 终端输出的地址包含 `/Learning_mobile_app/`，形如 `http://localhost:4173/Learning_mobile_app/`

- [ ] **Step 3: 浏览器逐项验收**

在 preview 页面上确认以下每一项，逐条记录通过/失败：

- 首页 hero 正常，五张 feature 卡文案与链接正确
- 顶部导航五项 + 首页 + GitHub 共七项，逐个点击均不 404
- 五大块侧边栏各自独立、不串块，首项均为「概览」
- 五个块首页的规划清单 checkbox 正常渲染，条目数分别为 10 / 11 / 9 / 9 / 6
- 浏览器标签页显示 favicon（不是默认地球图标）
- 暗色模式切换正常，切换后侧边栏与代码块配色无异常
- 任一块首页底部显示「更新于」（骨架阶段无章节页，块首页即为唯一可检查对象）
- 页面无横向滚动条、无控制台 404 报错

控制台检查方式：打开浏览器开发者工具 Network 面板刷新首页，筛选 4xx/5xx，Expected 为空。

Run: `Ctrl+C` 停止 preview

- [ ] **Step 4: 确认工作树干净、提交完整**

Run: `git status --short && git log --oneline`
Expected: `git status` 无输出；`git log` 显示 Task 1–11 的提交（Task 6、Task 9 可能无提交），加上此前的 `65c451d docs: 添加移动端学习电子书设计文档`

- [ ] **Step 5: 不要推送，并显式移交剩余验收项**

**实现者不得执行 `git push`。** 推送到远端属于影响共享状态的操作，需用户明确授权。

设计文档「验证标准」共四条，前三条（构建通过、死链保护武装、preview 浏览器实测）
已在 Task 6 与 Task 12 Step 1–3 覆盖。**第四条无法在本计划内完成，必须移交用户**：

> 首次推送后访问真实地址，确认无资源 404（重点看 base 路径是否生效）

在最终报告中明确告知用户以下三点，不要只说「可以推送了」：

1. 本地验收已通过，可以推送
2. 推送前需先完成「交付前提」中的两项：GitHub Pages Source 设为 GitHub Actions、
   git 身份配置
3. 推送后需自行访问 `https://erick785.github.io/Learning_mobile_app/` 完成第四条验收——
   重点看 CSS/JS 与 favicon 是否 404。本地 `docs:preview` 虽已带 base 验证，
   但 Pages 的实际路径行为仍需线上确认一次

---

## 实现期发现

实现过程中若出现以下情况，在此追加记录（含现象、原因、最终采用的写法），供后续维护参考：

- Task 4 Step 3 中侧边栏 `link` 前缀不符合预期，需调整 `basePath` / `scanStartPath` / `resolvePath` 组合
- Task 7 Step 3 中 hero/features 的 frontmatter link 未被 base 处理
- Task 9 中文搜索的实际表现，以及是否启用了按字切分 tokenizer
- 任何与本计划「Expected」不符的观测结果

### F1 — `.gitignore` 未覆盖根目录 `.vitepress/`（Task 2 期间发现并修正）

**现象**：Task 1 执行期间有进程在仓库根目录误跑过 vitepress，产生 `.vitepress/cache/deps_temp_*`。
计划 Task 1 Step 2 给定的 `.gitignore` 只写了 `docs/.vitepress/cache/` 与 `docs/.vitepress/dist/`，
挡不住根目录那份，导致 `git status` 被污染，Task 2 实现者顺手删掉了它。

该删除经核实是安全的：`git log --all -- .vitepress` 为空，该路径从未被 git 跟踪；
`git log --all --diff-filter=D --name-only` 全历史为空，仓库从未删除过任何受版本控制的文件。

**第一次修复尝试是错的，记录在此以免重犯**：把 `docs/.vitepress/cache/` 直接改成
`.vitepress/cache/`，以为这样"更宽"。实际按 gitignore 规则，**模式若以分隔符开头或中间含分隔符，
会被锚定到该 `.gitignore` 所在目录**，所以 `.vitepress/cache/` 只匹配根目录那份，
`docs/.vitepress/dist/` 反而不再被忽略——`git status` 立刻冒出 `?? docs/.vitepress/dist/`。

**最终写法**：用 `**/` 前缀显式表达"任意深度"。

```
**/.vitepress/cache/
**/.vitepress/dist/
```

**注意不可简化为 `**/.vitepress/`**：那会把 `docs/.vitepress/config.ts` 一起忽略掉，
而 config.ts 必须入库。只能忽略 `cache` 与 `dist` 两个子路径。

**验证方式**（四条断言，全部 PASS）：

```bash
git check-ignore -v docs/.vitepress/dist              # 应命中 **/.vitepress/dist/
mkdir -p .vitepress/cache/probe && git check-ignore -v .vitepress/cache/probe && rm -rf .vitepress
git check-ignore -v docs/.vitepress/config.ts         # 应无输出、退出码 1
git ls-files docs/.vitepress/                         # 应列出 config.ts
```

**对后续维护的提醒**：把 `**/` 前缀"改回"`docs/` 前缀看似无害，实则会在根目录误跑
vitepress 时重新暴露污染。`.gitignore` 中已留注释说明，勿删。

### F2 — 多侧边栏的外层 key 取自 `resolvePath`，不是 `basePath`（Task 4 实测发现）

**现象**：按 Task 4 原计划只设 `basePath: '/<dir>/'`，`debugPrint` 输出的结构是：

```json
{ "/": { "base": "/05-security/", "items": [{ "text": "概览", "link": "index.md" }] } }
```

**只有一个 key `"/"`，不是五个**。五块的配置全部塌缩到同一个 key 上互相覆盖，
只有数组里最后一项 `05-security` 存活。若直接部署，前四块没有侧边栏，
且 `05-security` 的侧边栏会因为 key 是 `"/"` 而在全站生效。

**根因**（`node_modules/vitepress-sidebar/dist/sidebar.js`，压缩代码中可辨识）：

```js
result[M.resolvePath || "/"] = { base: M.basePath || M.resolvePath || "/", items: [...] }
```

外层 key 取 `resolvePath`，`basePath` 只决定内层的 `base`（链接前缀）。
计划把两者的职责搞反了。

**修复**：每个选项对象同时设 `resolvePath` 与 `basePath` 为 `/<dir>/`。修复后
`debugPrint` 输出五个独立 key，每块 `items[0].text` 均为「概览」。

**顺带确证了设计阶段的不确定点**：`includeRootIndexFile: true` 确实能让块根目录的
`index.md` 进入自身侧边栏，且标题取自 frontmatter 的 `title`。

**计划 Step 3 第三条预期是错的，勿照它"修"**：计划要求 `link` 形如 `/01-fundamentals/`，
实际插件产出的是相对的 `"index.md"`，**这是正确的**。VitePress 的
`theme-default/support/sidebar.js` 中 `addBase()` 会把内层 `base` 前置拼到 `link` 上：

```js
const base = item.base || _base
if (base && item.link) item.link = base + item.link
```

得到 `/01-fundamentals/index.md`，再经 `normalizeLink()` 转成 `.html` 并套站点 `base`，
最终 href 为 `/Learning_mobile_app/01-fundamentals/index.html`。已在浏览器实测确认。

**验证方式**：

```bash
npm run docs:build            # debugPrint 输出应含 5 个独立 key
npm run docs:preview          # 浏览器打开 /Learning_mobile_app/01-fundamentals/
                              # 侧边栏应只有本块的「概览」，href 含完整 base 前缀
```

### F3 — 规划清单不能用 `- [ ]` 复选框语法（Task 4 浏览器实测发现）

**现象**：Task 4 Step 4 用浏览器打开块首页，规划清单渲染成纯文本
`[ ] Dart（Flutter）`，方括号是字面字符，不是复选框。构建产物中确认为
`<li>[ ] Dart（Flutter）</li>`。

**根因**：VitePress 1.6.4 **不打包** markdown-it 的 task list 支持。在
`node_modules/vitepress/dist/` 下对 `task-list` / `taskList` / `task_list` 全量 grep
**零命中**。这是框架能力缺失，不是配置漏项。

**为什么不加插件**：`markdown-it-task-lists` 之类插件渲染出的是
`<input type="checkbox" disabled>`，永远点不动，纯装饰——「勾掉」无论如何都得改
markdown 源文件。为一个不可交互的外观多引一个第三方依赖不划算，且「长得像复选框
但点不动」正属于应当避免的半吊子状态。

**已采用的方案**（经用户确认）：普通无序列表，**链接即已完成、纯文本即待写**。

```markdown
## 规划

- Dart（Flutter）                              ← 待写
- [异步编程](./async-programming.md)            ← 已写完
```

进度不需要图例就能看出来，且完成后自然形成到章节的入口。

**⚠️ 计划 Task 3 Step 1–5 的五个代码块格式已作废**：其中的 `- [ ] ` 前缀需全部去掉，
改为 `- `。若日后照 Task 3 原文重建这五个文件，会重现本缺陷。条目文字、顺序、
`###` 分组结构均不变，**只去掉 `- [ ] ` 前缀**（共 45 处：10 / 11 / 9 / 9 / 6）。

设计文档中「以 checkbox 形式呈现，写完一篇勾掉一篇」的表述已同步修正。

**验证方式**：

```bash
npm run docs:build
grep -c '\[ \]' docs/.vitepress/dist/*/index.html   # 各文件应为 0
```

### F4 — frontmatter 里的 hero/features 链接会自动套 base（已确证的非问题）

Task 7 Step 3 曾预留一个 fallback：若 hero actions 与 features 的 `link` 未被 base
处理，就把它们改写成硬编码全路径 `/Learning_mobile_app/01-fundamentals/`。

**实测结论：不需要，fallback 作废。** 浏览器快照确认渲染出的 href 已含完整前缀：

- hero action「开始阅读」→ `/Learning_mobile_app/01-fundamentals/`
- 五张 feature 卡 → `/Learning_mobile_app/<各块>/`
- 外部链接（GitHub）保持原样，未被套 base

配合 `curl` 对六个路由全部返回 200，以及控制台无任何报错，跳转成立。

**提醒**：不要为了"保险"把这些 link 改成硬编码全路径。当前写法 `link: /01-fundamentals/`
是正确的，硬编码会在 `base` 变更时（例如改用自定义域名）全站失效。

### F5 — 本地搜索分词：计划给错了配置路径，且函数序列化有运行时陷阱（Task 9）

本条包含三件事，其中第二件会导致**构建全绿但浏览器里搜索完全失效**，务必留意。

**（1）计划 Task 9 Step 3 的配置路径少了一层 `options`，会静默失效**

计划写的是 `search.options.miniSearch.tokenize`，**正确路径是
`search.options.miniSearch.options.tokenize`**。依据：

- 构建期（`dist/node/chunk-D3CUZ4fa.js`）：
  `new MiniSearch({ fields, storeFields, ...options.miniSearch?.options })`
- 客户端（`VPLocalSearchBox.vue`）：
  `MiniSearch.loadJSON(data, { fields, storeFields, searchOptions: {...}, ...miniSearch?.options })`
- 类型定义（`types/default-theme.d.ts`）：
  `miniSearch?: { options?: Pick<MiniSearchOptions, 'extractField'|'tokenize'|'processTerm'|...>, searchOptions?: ... }`

写错层级不会报错，只是分词器根本没生效——索引仍是默认分词。

顺带一个好消息：`miniSearch.options` 在构建期与客户端 `loadJSON` **两处都被展开**，
所以只配一份 `tokenize` 就同时覆盖索引与查询，不会出现两端分词器不一致。

**（2）themeConfig 里的函数被序列化时不带模块作用域 —— 真正的坑**

VitePress 把 `themeConfig` 内联进每个 HTML 的 `window.__VP_SITE_DATA__`，
函数用 `_vp-fn_` 前缀转成字符串，客户端这样重建：

```js
value.startsWith("_vp-fn_") ? new Function(`return ${value.slice(7)}`)() : value
```

**`new Function` 创建的函数作用域是全局**，只能访问全局变量。所以第一版实现里
函数体引用的模块级 `const CJK = /[\u3400-\u4dbf...]/` **不会被带走**，
序列化结果长这样：

```js
function tokenize(text) { ... if (chars.length < 2 || !CJK.test(word)) ... }  // CJK 未定义
```

后果：**构建期完全正常**（那时 `CJK` 在模块作用域里，索引也正确生成为二字 token），
但浏览器里一执行搜索就 `ReferenceError: CJK is not defined`，搜索整体失效。
构建绿、类型检查绿、`dist` 里索引也对——只有真在浏览器搜一次才会暴露。

修复：把正则**内联进函数体**，让函数完全自包含，并删掉模块级 `CJK` 常量。
`config.ts` 中已留注释说明此约束，**不要把正则再提取成模块级常量**。

TypeScript 类型注解不受影响：序列化前已被转译掉（产物中是 `function tokenize(text)`、
`const bigrams = []`，注解均已剥除）。

**（3）Task 9 Step 1 的预设判断偏严，实际缺口比计划设想的小**

计划假设「中文无空格分词 → 搜不到中文」。实测：VitePress 客户端 `searchOptions` 默认带
`prefix: true` 与 `fuzzy: 0.2`，所以**前缀型片段本来就能命中**：

| 查询 | 改前 | 改后 |
| --- | --- | --- |
| 异步编程 / 崩溃监控 / 状态管理 / Keychain / Flutter | 命中 | 命中 |
| 异步、崩溃、弱网（复合词**前**半段） | 命中（靠 `prefix:true`） | 命中 |
| 编程、鉴权、签名（复合词**后**半段） | **MISS** | 命中 |

真正缺的只是复合词后半段（`异步编程`→`编程`、`登录鉴权`→`鉴权`、`打包签名`→`签名`）。
二字滑窗正好补这个洞，且噪音远小于单字切分。

**踩过的测量错误，记录以免重犯**：第一次测查询时用了
`MiniSearch.loadJSON(json, { fields })` 的**裸默认** searchOptions，没带客户端实际的
`prefix: true, fuzzy: 0.2`，于是得出「异步、崩溃、弱网 全部 MISS」的错误结论。
**测量必须复刻被测方的真实配置**，否则会高估问题严重性。

**验证方式**（本次采用，比在浏览器里手点更强）：写一个临时 Node 脚本，
从 `dist/index.html` 提取 `__VP_SITE_DATA__` 的 JSON 实参 → 复刻客户端
`deserializeFunctions`（`_vp-fn_` + `new Function`）重建 `tokenize` → 用重建出的函数
加上真实索引与客户端同款 `searchOptions` 跑 `MiniSearch.loadJSON(...).search(q)`。
这样同时验证了「函数能否在客户端重建执行」与「端到端能否搜到」，跑完即删。

本次结果：`tokenize("登录鉴权") => ["登录","录鉴","鉴权"]`、
`tokenize("Flutter UI") => ["Flutter","UI"]`（拉丁词原样保留），
15 个查询全部命中，`状态管理` 正确命中 `02-client` 与 `03-engineering` 两块。

### F6 — `npm ci` 的 allow-scripts 警告属无害（Task 11 本地预演观察）

Task 11 Step 3 在本地清空 `node_modules` 后跑 `npm ci` 预演 CI，退出码 0、
`package-lock.json` 未被改动（说明锁文件与 `package.json` 严格同步），但 npm 11.16.0
打出警告：

```
npm warn allow-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn allow-scripts   fsevents@2.3.3 (install: (install scripts present))
npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, ...
```

npm 11 默认拦截依赖的安装脚本。`esbuild` 的 postinstall 看起来关键（负责平台二进制），
但**实测构建照常成功**：

```bash
npm run docs:build        # exit 0, build complete
ls node_modules/@esbuild/ # darwin-arm64
node -p "require('esbuild').version"   # 0.21.5
```

原因：esbuild 0.21.5 通过 **optionalDependencies**（`@esbuild/darwin-arm64`、
`@esbuild/linux-x64` 等）分发平台二进制，postinstall 只做校验与链接，被拦不影响。
`fsevents` 仅用于 macOS 文件监听，CI 是 ubuntu，本就不需要。

**结论：不需要执行 `npm approve-scripts`，也不要在 workflow 里加绕过脚本拦截的参数。**

**万一 CI 上构建真的失败**且报 esbuild 相关错误，排查顺序：
1. `actions/setup-node@v7` 装的 npm 版本是否引入了更严格的脚本策略
2. `npm ci` 步骤的完整日志里有没有 optional dependencies 被跳过的提示
   （例如 `--no-optional`、`omit=optional` 之类配置）
3. 确认 `package-lock.json` 中 `@esbuild/linux-x64` 条目存在且 `optional: true`
