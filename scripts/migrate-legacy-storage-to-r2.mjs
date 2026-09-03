import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const execFileAsync = promisify(execFile)
const sourceBucket = process.env.SOURCE_STORAGE_BUCKET || 'akhweb'
const targetBucket = process.env.TARGET_R2_BUCKET || 'festapp-images-akhweb'
const verifyOnly = process.argv.includes('--verify-only')
const concurrency = Number(process.env.MIGRATION_CONCURRENCY || 4)

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

const source = createClient(
  required('SOURCE_SUPABASE_URL'),
  required('SOURCE_SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false, autoRefreshToken: false } },
)

async function listObjects(prefix = '') {
  const objects = []
  const pageSize = 100
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await source.storage.from(sourceBucket).list(prefix, {
      limit: pageSize,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) throw error
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id) objects.push({ ...item, path })
      else objects.push(...await listObjects(path))
    }
    if (data.length < pageSize) break
  }
  return objects
}

async function sourceBytes(path) {
  const { data, error } = await source.storage.from(sourceBucket).download(path)
  if (error) throw error
  return Buffer.from(await data.arrayBuffer())
}

async function readR2(path, destination) {
  try {
    await execFileAsync('npx', [
      '--yes', 'wrangler', 'r2', 'object', 'get', `${targetBucket}/${path}`,
      '--file', destination, '--remote',
    ], { timeout: 60_000, maxBuffer: 1024 * 1024 })
    return await readFile(destination)
  } catch (error) {
    const detail = `${error?.stdout || ''}\n${error?.stderr || ''}`
    if (/not found|does not exist|404/i.test(detail)) return null
    throw error
  }
}

async function putR2(path, sourcePath, contentType) {
  await execFileAsync('npx', [
    '--yes', 'wrangler', 'r2', 'object', 'put', `${targetBucket}/${path}`,
    '--file', sourcePath, '--content-type', contentType || 'application/octet-stream',
    '--remote',
  ], { timeout: 60_000, maxBuffer: 1024 * 1024 })
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

async function migrateObject(object, scratch) {
  const safeName = createHash('sha256').update(object.path).digest('hex')
  const sourcePath = join(scratch, `${safeName}.source`)
  const targetPath = join(scratch, `${safeName}.target`)
  const bytes = await sourceBytes(object.path)
  const sourceHash = sha256(bytes)
  let target = await readR2(object.path, targetPath)
  if (!target) {
    if (verifyOnly) throw new Error(`Target object missing: ${object.path}`)
    await writeFile(sourcePath, bytes)
    await putR2(object.path, sourcePath, object.metadata?.mimetype)
    target = await readR2(object.path, targetPath)
    if (!target) throw new Error(`Uploaded object cannot be read: ${object.path}`)
  }
  if (sha256(target) !== sourceHash) throw new Error(`Target hash differs: ${object.path}`)
  await rm(sourcePath, { force: true })
  await rm(targetPath, { force: true })
  return { path: object.path, bytes: bytes.length, hash: sourceHash }
}

async function runPool(items, worker) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = next++
      if (index >= items.length) return
      results[index] = await worker(items[index])
      if ((index + 1) % 25 === 0 || index + 1 === items.length) {
        console.log(`Verified ${index + 1}/${items.length}`)
      }
    }
  }))
  return results
}

async function main() {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12) {
    throw new Error('MIGRATION_CONCURRENCY must be an integer from 1 to 12')
  }
  const scratch = await mkdtemp(join(tmpdir(), 'akhweb-r2-migration-'))
  try {
    const objects = await listObjects()
    const results = await runPool(objects, (object) => migrateObject(object, scratch))
    const bytes = results.reduce((sum, item) => sum + item.bytes, 0)
    const manifestSha256 = sha256(Buffer.from(
      results.map((item) => `${item.path}\t${item.bytes}\t${item.hash}`).sort().join('\n'),
    ))
    console.log(JSON.stringify({ sourceBucket, targetBucket, objects: results.length, bytes, manifestSha256 }))
  } finally {
    await rm(scratch, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
