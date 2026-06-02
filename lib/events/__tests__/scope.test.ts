import { describe, it, expect } from 'vitest'
import { scopeOrganizerId } from '../scope'

describe('scopeOrganizerId', () => {
  it('forces an organizer onto their own organization regardless of the requested value', () => {
    // An org-user must never be able to target AKH (null) or another organization.
    expect(scopeOrganizerId('organizer', 'org-1', null)).toBe('org-1')
    expect(scopeOrganizerId('organizer', 'org-1', 'org-2')).toBe('org-1')
    expect(scopeOrganizerId('organizer', 'org-1', 'org-1')).toBe('org-1')
  })

  it('lets an admin choose any organizer, including AKH (null)', () => {
    expect(scopeOrganizerId('admin', null, null)).toBeNull()
    expect(scopeOrganizerId('admin', null, 'org-2')).toBe('org-2')
  })

  it('lets an editor choose any organizer, including AKH (null)', () => {
    expect(scopeOrganizerId('editor', null, null)).toBeNull()
    expect(scopeOrganizerId('editor', null, 'org-3')).toBe('org-3')
  })
})
