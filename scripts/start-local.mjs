import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const appRoot = process.cwd()
const localStandaloneServer = path.join(appRoot, '.next', 'standalone', 'server.js')
const standaloneServer = fs.existsSync(localStandaloneServer)
  ? localStandaloneServer
  : path.join(appRoot, 'server.js')
const standaloneRoot = path.dirname(standaloneServer)

// Next's standalone server resolves static files relative to its own directory.
// Keep local standalone output laid out like the production Docker image.
const staticSource = path.join(appRoot, '.next', 'static')
const staticTarget = path.join(standaloneRoot, '.next', 'static')
if (fs.existsSync(staticSource)) {
  fs.rmSync(staticTarget, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(staticTarget), { recursive: true })
  fs.cpSync(staticSource, staticTarget, { recursive: true })
}

const publicSource = path.join(appRoot, 'public')
const publicTarget = path.join(standaloneRoot, 'public')
if (fs.existsSync(publicSource) && path.resolve(publicSource) !== path.resolve(publicTarget)) {
  fs.rmSync(publicTarget, { recursive: true, force: true })
  fs.cpSync(publicSource, publicTarget, { recursive: true })
}

process.env.SQLITE_PATH ??= path.join(appRoot, 'data', 'crm.sqlite')
process.env.PORT ??= '7800'
process.env.HOSTNAME ??= '0.0.0.0'
process.env.BETTER_AUTH_URL ??= `http://localhost:${process.env.PORT}`
process.env.BETTER_AUTH_SECRET ??= 'alma-secret-crm-key-32-chars-long-stable-salt'

await import(pathToFileURL(standaloneServer).href)
