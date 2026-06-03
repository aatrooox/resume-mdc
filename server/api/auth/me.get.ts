export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { user: null }

  const user = await verifyJWT(token)
  return { user }
})
