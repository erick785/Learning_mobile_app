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
