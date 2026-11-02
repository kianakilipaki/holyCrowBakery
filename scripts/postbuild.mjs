import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve('dist')
const indexPath = path.join(distDir, 'index.html')
const fallbackPath = path.join(distDir, '404.html')

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, fallbackPath)
}
