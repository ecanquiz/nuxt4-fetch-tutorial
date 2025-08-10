import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HTTP en Nuxt4",
  description: "nuxt4-fetch-tutorial",
  base: '/nuxt4-fetch-tutorial/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Empezar', link: '/get-started' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Empezar', link: '/get-started' },
          { text: 'Establece bases URL', link: '/set-url-bases' },
          { text: 'useFetch', link: '/use-fetch' },
          { text: '$fetch', link: '/dolar-fetch' },          
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ecanquiz/nuxt4-fetch-tutorial' }
    ]
  }
})
