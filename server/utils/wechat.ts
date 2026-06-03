import { SignJWT, jwtVerify } from 'jose'

interface WxConfig {
  appId: string
  appSecret: string
  token: string
}

interface WxUser {
  openid: string
  nickname?: string
  headimgurl?: string
}

const getWxConfig = (): WxConfig => {
  const config = useRuntimeConfig()
  return {
    appId: config.wxAppId as string,
    appSecret: config.wxAppSecret as string,
    token: config.wxToken as string,
  }
}

export const getWxAuthUrl = (redirectUri: string, state: string): string => {
  const { appId } = getWxConfig()
  const encoded = encodeURIComponent(redirectUri)
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encoded}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
}

export const getWxAccessToken = async (code: string): Promise<{ access_token: string; openid: string }> => {
  const { appId, appSecret } = getWxConfig()
  const res = await $fetch<{ access_token: string; openid: string }>(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  )
  return res
}

export const getWxUserInfo = async (accessToken: string, openid: string): Promise<WxUser> => {
  const res = await $fetch<WxUser>(
    `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
  )
  return res
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production')

export const createJWT = async (payload: WxUser): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export const verifyJWT = async (token: string): Promise<WxUser | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as WxUser
  } catch {
    return null
  }
}
