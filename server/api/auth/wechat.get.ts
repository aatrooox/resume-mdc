export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const redirect = (query.redirect as string) || '/editor'
  const state = Buffer.from(redirect).toString('base64')

  const url = getWxAuthUrl(
    `https://${getHeader(event, 'host')}/api/auth/callback`,
    state
  )

  await sendRedirect(event, url)
})
