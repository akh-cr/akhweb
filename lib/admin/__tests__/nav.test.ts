import { describe, it, expect } from 'vitest'
import { getAdminNavItems } from '../nav'

const urls = (role: 'admin' | 'editor' | 'organizer') =>
  getAdminNavItems(role).map((i) => i.url)

describe('getAdminNavItems', () => {
  it('gives an organizer only the external-invitations section', () => {
    expect(urls('organizer')).toEqual(['/admin/pozvanky'])
  })

  it('gives an admin the full menu including users and external invitations', () => {
    const u = urls('admin')
    expect(u).toContain('/admin/events')
    expect(u).toContain('/admin/pozvanky')
    expect(u).toContain('/admin/users')
  })

  it('gives an editor content sections and external invitations but not user management', () => {
    const u = urls('editor')
    expect(u).toContain('/admin/events')
    expect(u).toContain('/admin/pozvanky')
    expect(u).not.toContain('/admin/users')
  })
})
