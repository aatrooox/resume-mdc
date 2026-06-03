import type { Ref } from 'vue'

interface User {
  openid: string
  nickname?: string
  headimgurl?: string
}

const user = ref<User | null>(null)
const loading = ref(true)

export const useAuth = () => {
  const isLoggedIn = computed(() => !!user.value)

  onMounted(async () => {
    // Only fetch on client side (SSR doesn't have cookies)
    if (import.meta.server) return
    try {
      const data = await $fetch<{ user: User | null }>('/api/auth/me')
      user.value = data.user
    } finally {
      loading.value = false
    }
  })

  const login = () => {
    const current = encodeURIComponent(window.location.href)
    window.location.href = `/api/auth/wechat?redirect=${current}`
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isLoggedIn, loading, login, logout }
}
