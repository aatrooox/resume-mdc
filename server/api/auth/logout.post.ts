export default defineEventHandler(async (event) => {
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return { success: true }
})
