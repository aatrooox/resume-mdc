import { sendRedirect } from 'h3'
import { getNezusOAuthConfig, buildAuthorizeUrl } from '~~/server/utils/oauth-client'

export default defineEventHandler(async (event) => {
  const config = getNezusOAuthConfig()
  const url = buildAuthorizeUrl(config)
  return sendRedirect(event, url)
})
