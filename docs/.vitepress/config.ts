import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

const base = '/Learning_mobile_app/'

const parts = [
  { dir: '01-fundamentals', title: '基础' },
  { dir: '02-client', title: '客户端开发' },
  { dir: '03-engineering', title: '工程化' },
  { dir: '04-testing', title: '测试' },
  { dir: '05-security', title: '安全' },
]

// minisearch 默认按空白与标点分词，中文没有空格，整段会被当成单个 token。
// 客户端默认 prefix:true 能让「异步」命中「异步编程」，但复合词后半段（编程、
// 鉴权、签名）够不着。二字滑窗补齐这类查询，纯拉丁词原样保留不影响英文搜索。
//
// 此函数会被 VitePress 以 _vp-fn_ 机制序列化后送到客户端，**只带走函数体本身**，
// 不会带上模块作用域。因此函数内不得引用任何外部变量（含模块级 const），
// 否则构建期正常、浏览器里一搜索就抛 ReferenceError。正则必须内联。
function tokenize(text: string): string[] {
  return text
    .split(/[\n\r\p{Z}\p{P}]+/u)
    .filter(Boolean)
    .flatMap((word) => {
      const chars = [...word]
      if (chars.length < 2 || !/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(word)) {
        return [word]
      }
      const bigrams: string[] = []
      for (let i = 0; i < chars.length - 1; i++) {
        bigrams.push(chars[i] + chars[i + 1])
      }
      return bigrams
    })
}

// debugPrint 会打印生成的侧边栏结构，仅在排查侧边栏问题时临时开启
const sidebarDebug = false

const sidebar = generateSidebar(
  parts.map((p) => ({
    documentRootPath: '/docs',
    scanStartPath: p.dir,
    basePath: `/${p.dir}/`,
    resolvePath: `/${p.dir}/`,
    includeRootIndexFile: true,
    useTitleFromFrontmatter: true,
    frontmatterTitleFieldName: 'title',
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 0,
    excludeByGlobPattern: ['**/README.md'],
    debugPrint: sidebarDebug,
  })),
)

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
    sidebar,
    search: {
      provider: 'local',
      options: {
        // 必须是 miniSearch.options.tokenize：构建期与客户端 loadJSON 都展开这一层。
        // 写成 miniSearch.tokenize 会被静默忽略。
        miniSearch: {
          options: { tokenize },
        },
      },
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '更新于' },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
  },
})
