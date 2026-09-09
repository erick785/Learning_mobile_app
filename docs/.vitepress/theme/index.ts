import DefaultTheme from 'vitepress/theme'
// 公共导出没有 VPFlyout，走 ./dist/* 深路径（包 exports 明确放行）。
// 版本锁 1.6.4；升级 vitepress 时若路径变动，构建会直接报错而非静默坏
import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue'
import { h, onMounted, ref } from 'vue'
import './custom.css'

const STORAGE_KEY = 'vp-style-theme'

const STYLES = [
  { key: 'neon', label: '青蓝', dot: '#22d3ee' },
  { key: 'cyberpunk', label: '赛博朋克', dot: 'linear-gradient(135deg, #ff2a6d, #05d9e8)' },
]

// 深色配色风格切换，仅影响深色模式。
// 初始值由 config.ts head 的内联脚本在水合前写入 data-theme（防闪烁），
// 这里负责读取当前值、切换与持久化。
const StyleSwitch = {
  setup() {
    const current = ref('neon')
    onMounted(() => {
      if (document.documentElement.dataset.theme === 'cyberpunk') {
        current.value = 'cyberpunk'
      }
    })
    const select = (key: string) => {
      current.value = key
      document.documentElement.dataset.theme = key
      localStorage.setItem(STORAGE_KEY, key)
    }
    return () =>
      h(
        VPFlyout,
        {
          class: 'vp-style-switch',
          button: STYLES.find((s) => s.key === current.value)?.label,
          label: '切换深色配色风格',
        },
        () =>
          h(
            'div',
            { class: 'vp-style-menu' },
            STYLES.map((s) =>
              h(
                'button',
                {
                  class: ['vp-style-option', { active: s.key === current.value }],
                  onClick: () => select(s.key),
                },
                [
                  h('span', { class: 'vp-style-dot', style: `background:${s.dot}` }),
                  s.label,
                ],
              ),
            ),
          ),
      )
  },
}

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(StyleSwitch),
    })
  },
}
