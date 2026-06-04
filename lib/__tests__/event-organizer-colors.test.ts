import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ORGANIZER_COLOR_OPTIONS } from '../event-organizer-colors'

const MIGRATIONS_DIR = join(process.cwd(), 'supabase/migrations')

/**
 * Extracts the effective set of hex values permitted by the
 * `event_organizers_color_hex_check` constraint, as defined by the migrations.
 * Migrations are timestamp-prefixed, so lexicographic order == chronological
 * order; the last migration that (re)defines the constraint wins.
 */
function getConstraintAllowedColors(): Set<string> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const constraintRegex =
    /ADD\s+CONSTRAINT\s+event_organizers_color_hex_check\s+CHECK\s*\(\s*color_hex\s+IN\s*\(([^)]*)\)/gi

  let allowed: Set<string> | null = null
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    let match: RegExpExecArray | null
    let lastInFile: string | null = null
    while ((match = constraintRegex.exec(sql)) !== null) {
      lastInFile = match[1]
    }
    if (lastInFile) {
      const hexes = lastInFile.match(/#[0-9a-fA-F]{3,6}/g) ?? []
      allowed = new Set(hexes.map((h) => h.toLowerCase()))
    }
  }

  if (!allowed) {
    throw new Error('No event_organizers_color_hex_check constraint found in migrations')
  }
  return allowed
}

describe('event_organizers color_hex DB constraint', () => {
  it('permits every color offered by ORGANIZER_COLOR_OPTIONS', () => {
    const allowed = getConstraintAllowedColors()
    const offered = ORGANIZER_COLOR_OPTIONS.map((o) => o.hex.toLowerCase())
    const missing = offered.filter((hex) => !allowed.has(hex))
    expect(missing).toEqual([])
  })
})
