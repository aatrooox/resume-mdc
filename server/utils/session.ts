import { SignJWT, jwtVerify } from 'jose'
import type { NezusUserInfo } from './oauth-client'

const getJwtSecret = () => {
  const config = useRuntimeConfig()
  return new TextEncoder().encode((config.jwtSecret as string) || 'dev-secret-change-in-production')
}

export const createSession = async (user: NezusUserInfo): Promise<string> => {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export const verifySession = async (token: string): Promise<NezusUserInfo | null> => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as NezusUserInfo
  } catch {
    return null
  }
}
