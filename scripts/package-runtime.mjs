#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const version = process.env.DSH_VERSION || pkg.dependencies?.['@deepseek-ai/dsh']
if (!version || !/^\d+\.\d+\.\d+([-.].*)?$/.test(version)) {
  throw new Error('package.json 缺少固定的 @deepseek-ai/dsh 版本')
}

const platform = process.env.RUNTIME_PLATFORM || process.platform
const arch = process.env.RUNTIME_ARCH || process.arch
const repository = process.env.GITHUB_REPOSITORY || 'xiaoda001/dsh-desktop-runtime'
const target = join(root, 'runtime')
const outputDir = join(root, 'runtime-dist')
const archiveName = `dsh-runtime-${version}-${platform}-${arch}${platform === 'win32' ? '.zip' : '.tar.gz'}`
const archive = join(outputDir, archiveName)
const manifestName = `latest-${platform}-${arch}.json`

if (existsSync(target)) rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
writeFileSync(join(target, 'package.json'), JSON.stringify({ name: 'dsh-runtime', private: true, dependencies: { '@deepseek-ai/dsh': version } }, null, 2))
execFileSync('pnpm', ['install', '--no-frozen-lockfile', '--node-linker=hoisted', '--ignore-scripts'], { cwd: target, stdio: 'inherit' })

const marker = join(target, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
if (!existsSync(marker)) throw new Error(`runtime 不完整: ${marker}`)

mkdirSync(outputDir, { recursive: true })
if (existsSync(archive)) rmSync(archive, { force: true })
if (platform === 'win32') {
  execFileSync('tar', ['-a', '-cf', archive, '-C', target, 'node_modules', 'package.json'], { stdio: 'inherit' })
} else {
  execFileSync('tar', ['-czf', archive, '-C', target, 'node_modules', 'package.json'], { stdio: 'inherit' })
}

const hash = createHash('sha256')
await pipeline(createReadStream(archive), hash)
const sha256 = hash.digest('hex')
const manifest = {
  package: '@deepseek-ai/dsh',
  version,
  platform,
  arch,
  archive: platform === 'win32' ? 'zip' : 'tar.gz',
  url: `https://github.com/${repository}/releases/download/dsh-runtime-${version}/${archiveName}`,
  sha256
}
writeFileSync(join(outputDir, manifestName), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`[runtime-package] ${archiveName}`)
console.log(`[runtime-package] sha256=${sha256}`)
