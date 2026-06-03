export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string

  if (!code) {
    throw createError({ statusCode: 400, message: 'Missing code' })
  }

  const { access_token, openid } = await getWxAccessToken(code)
  const user = await getWxUserInfo(access_token, openid)
  const token = await createJWT(user)

  const redirect = state ? Buffer.from(state, 'base64').toString('utf-8') : '/editor'

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 3600,
    path: '/',
    sameSite: 'lax',
  })

  await sendRedirect(event, redirect)
})
