#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const packagePath = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
const recorded = pkg.dependencies?.['@deepseek-ai/dsh']
if (!recorded || !/^\d+\.\d+\.\d+([-.].*)?$/.test(recorded)) {
  throw new Error('package.json 必须记录一个固定的 @deepseek-ai/dsh 版本')
}

const latest = execFileSync('npm', ['view', '@deepseek-ai/dsh', 'version'], { encoding: 'utf8' }).trim()
console.log(`[runtime-check] recorded=${recorded} latest=${latest}`)

if (recorded === latest) {
  console.log('[runtime-check] runtime 已是最新版本')
  process.exit(0)
}

pkg.dependencies['@deepseek-ai/dsh'] = latest
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`[runtime-check] 已更新 package.json: ${recorded} -> ${latest}`)
process.exit(2)
