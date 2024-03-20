import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Learning Docker",
  description: "Core Featrue",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Docker入门与实战',
        items: [
          { text: '基础知识', link: '/Docker' },
          { text: '持久化', link: '/Persistence' },
          { text: '网络', link: '/Networking' },
          { text: 'Docker构建', link: '/DockerBuild' },
          { text: '更新日志', link: '/changelog' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/GitHub-Stephen/learning-docker' }
    ]
  }
})
