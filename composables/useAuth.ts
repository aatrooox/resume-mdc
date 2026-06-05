interface User {
  userId: string
  email: string
  username: string
  role: string
}

const user = ref<User | null>(null)
const loading = ref(true)

export const useAuth = () => {
  const isLoggedIn = computed(() => !!user.value)

  onMounted(async () => {
    if (import.meta.server) return
    try {
      const data = await $fetch<{ user: User | null }>('/api/auth/me')
      user.value = data.user
    } finally {
      loading.value = false
    }
  })

  const login = () => {
    window.location.href = '/api/auth/login'
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
  }
}
