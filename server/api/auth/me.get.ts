import { verifySession } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { user: null }
  const user = await verifySession(token)
  return { user }
})
