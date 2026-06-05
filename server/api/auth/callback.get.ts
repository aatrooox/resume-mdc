import { getQuery, setCookie, sendRedirect } from 'h3'
import { getNezusOAuthConfig, exchangeCodeForToken, fetchNezusUserInfo } from '~~/server/utils/oauth-client'
import { createSession } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code || '')

  if (!code) {
    return sendRedirect(event, '/editor?error=no_code')
  }

  const config = getNezusOAuthConfig()

  try {
    const tokenResp = await exchangeCodeForToken(config, code)
    const userInfo = await fetchNezusUserInfo(config, tokenResp.access_token)

    const token = await createSession(userInfo)

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600,
      path: '/',
      sameSite: 'lax',
    })

    return sendRedirect(event, '/editor')
  } catch (err) {
    console.error('[auth:callback]', err)
    return sendRedirect(event, '/editor?error=oauth_failed')
  }
})
