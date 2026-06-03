import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  const validTemplates = ['tech', 'fresh-grad', 'management', 'blank']

  if (!name || !validTemplates.includes(name)) {
    throw createError({ statusCode: 404, message: 'Template not found' })
  }

  const content = await readFile(
    join(process.cwd(), 'templates', `${name}.md`),
    'utf-8'
  )
  return content
})
