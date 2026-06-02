import { describe, it, expect } from 'vitest'
import { shouldShowOrganizerBadge } from '../display'

describe('shouldShowOrganizerBadge', () => {
  it('hides the badge for AKH events (no organizer)', () => {
    expect(shouldShowOrganizerBadge({ organizer_id: null })).toBe(false)
    expect(shouldShowOrganizerBadge({ organizer_id: undefined })).toBe(false)
  })

  it('shows the badge for external invitations', () => {
    expect(shouldShowOrganizerBadge({ organizer_id: 'org-1' })).toBe(true)
  })
})
