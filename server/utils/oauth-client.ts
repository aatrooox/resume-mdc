/**
 * OAuth2 Client utility for *.nezus.cn sub-projects.
 *
 * Copy this file into the sub-project's server/utils/ directory, then create
 * two thin API endpoints (see docs/oauth-subproject-guide.md).
 *
 * Requires these env vars:
 *   NUXT_NEZUS_AUTH_URL=https://app.nezus.cn
 *   NUXT_NEZUS_CLIENT_ID=<your client_id>
 *   NUXT_NEZUS_CLIENT_SECRET=<your client_secret>
 */

import process from 'node:process'

export function getNezusOAuthConfig() {
  return {
    authUrl: process.env.NUXT_NEZUS_AUTH_URL || 'https://app.nezus.cn',
    clientId: process.env.NUXT_NEZUS_CLIENT_ID || '',
    clientSecret: process.env.NUXT_NEZUS_CLIENT_SECRET || '',
    redirectUri: process.env.NUXT_NEZUS_REDIRECT_URI || '',
  }
}

export function buildAuthorizeUrl(config: ReturnType<typeof getNezusOAuthConfig>, state?: string) {
  const url = new URL('/api/v1/oauth/authorize', config.authUrl)
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  if (state)
    url.searchParams.set('state', state)
  return url.toString()
}

export interface NezusTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function exchangeCodeForToken(
  config: ReturnType<typeof getNezusOAuthConfig>,
  code: string,
): Promise<NezusTokenResponse> {
  const res = await fetch(`${config.authUrl}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  return json.data as NezusTokenResponse
}

export interface NezusUserInfo {
  userId: string
  email: string
  username: string
  role: string
  membership: {
    plan: string | null
    planId: string
    status: string
    expiresAt: string | null
  } | null
}

export async function fetchNezusUserInfo(
  config: ReturnType<typeof getNezusOAuthConfig>,
  accessToken: string,
): Promise<NezusUserInfo> {
  const res = await fetch(`${config.authUrl}/api/v1/oauth/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`UserInfo fetch failed: ${res.status} ${text}`)
  }

  const json = await res.json()
  return json.data as NezusUserInfo
}
