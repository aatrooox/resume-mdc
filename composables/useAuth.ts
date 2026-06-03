export const useAuth = () => {
  const isLoggedIn = ref(false)
  const login = () => {}
  return { isLoggedIn, login }
}
