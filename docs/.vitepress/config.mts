import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HTTP en Nuxt4",
  description: "nuxt4-fetch-tutorial",
  base: '/nuxt4-fetch-tutorial/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/me.jpg',
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Comenzar', link: '/get-started/' },
      { text: 'ecanquiz', link: 'https://ecanquiz.github.io/' },  
    ],

    sidebar: [
      {
        //text: 'Examples',
        items: [
          { text: 'Empezar', link: '/get-started' },
          { text: 'Bases URL', link: '/set-url-bases' },
          { text: 'useFetch', link: '/use-fetch' },
          { text: '$fetch', link: '/dolar-fetch' },
          { text: 'useAsyncData', link: '/use-async-data' },
          { text: 'useNuxtData', link: '/use-nuxt-data' },
          { text: 'useRequestFetch', link: '/use-request-fetch' },
          { text: 'useState', link: '/use-state' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ecanquiz/nuxt4-fetch-tutorial' }
    ]
  }
})
