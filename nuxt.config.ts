export default defineNuxtConfig({
  modules: ['@nuxtjs/mdc', '@nuxtjs/tailwindcss'],

  mdc: {
    components: {
      prose: false,
      map: {
        'resume-header': 'ResumeHeader',
        'resume-section': 'ResumeSection',
        'resume-item': 'ResumeItem',
        'skill-tags': 'SkillTags',
        'timeline': 'Timeline',
        'skill-bar': 'SkillBar',
        'contact-icons': 'ContactIcons',
        'quote': 'QuoteBlock',
        'card-grid': 'CardGrid',
        'divider': 'CustomDivider',
      }
    }
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: '#1E3A5F',
            accent: '#059669',
            surface: '#F8FAFC',
            foreground: '#0F172A',
            muted: '#F1F3F5',
            border: '#E4E7EB',
          },
          fontFamily: {
            sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
          },
          fontSize: {
            'body': ['16px', { lineHeight: '1.6' }],
          },
        },
      },
    },
  },

  components: {
    dirs: [
      { path: '~/components/editor', pathPrefix: false },
      { path: '~/components/mdc', pathPrefix: false },
    ],
  },

  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET || '',
  },

  devServer: {
    port: 4777,
  },

  nitro: {
    experimental: {
      openAPI: false,
    },
  },

  app: {
    head: {
      title: '在线简历编辑器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap' },
      ],
    },
  },

  compatibilityDate: '2025-01-01',
})
