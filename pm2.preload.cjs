const fs = require('node:fs')
const process = require('node:process')

function stripBOM(text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1)
  }
  return text
}

function parseEnv(content) {
  const out = {}
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) {
      continue
    }
    const clean = line.startsWith('export ')
      ? line.slice('export '.length).trim()
      : line
    const eq = clean.indexOf('=')
    if (eq < 0) {
      continue
    }
    const key = clean.slice(0, eq).trim()
    let val = clean.slice(eq + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const envPath = process.env.DOTENV_CONFIG_PATH || '/root/envs/resume-editor/.env'

try {
  let content = fs.readFileSync(envPath, 'utf8')
  content = stripBOM(content)
  const parsed = parseEnv(content)
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
catch (error) {
  console.error(`[pm2.preload] Failed to load env: ${envPath} -> ${error.message}`)
}
