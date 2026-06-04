import { describe, it, expect, vi } from 'vitest'
import { getPublicEvents, getEventDetail, getAdminEvents, EVENTS_SELECT } from '../read'

/**
 * Builds a chainable mock Supabase query builder. Every PostgREST filter/modifier
 * returns `this` so the chain can be inspected after the call. The terminal value
 * (resolved when the chain is awaited) is supplied per-test.
 */
function makeQueryBuilder(result: { data: unknown; count?: number | null }) {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    returns: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    // Awaiting the builder resolves to the configured result.
    then: (resolve: (value: unknown) => unknown) => resolve(result),
  }
  return builder
}

function makeClient(result: { data: unknown; count?: number | null }) {
  const builder = makeQueryBuilder(result)
  const client = {
    from: vi.fn().mockReturnValue(builder),
  }
  return { client, builder }
}

describe('EVENTS_SELECT', () => {
  it('always joins organizer name + color and the city so they never silently drop', () => {
    expect(EVENTS_SELECT).toContain('event_organizers(name, color_hex)')
    expect(EVENTS_SELECT).toContain('cities(')
    expect(EVENTS_SELECT).toContain('name')
  })
})

describe('getPublicEvents', () => {
  it('filters to AKH events (organizer_id IS NULL) using the canonical select', async () => {
    const data = [{ id: '1', title: 'AKH Event' }]
    const { client, builder } = makeClient({ data, count: null })

    const result = await getPublicEvents(client as any)

    // Uses the events table with the canonical join set.
    expect(client.from).toHaveBeenCalledWith('events')
    expect(builder.select).toHaveBeenCalled()
    const selectArg = builder.select.mock.calls[0][0] as string
    expect(selectArg).toContain('event_organizers(name, color_hex)')
    expect(selectArg).toContain('cities(')

    // AKH-vs-external filter: AKH events have a NULL organizer.
    expect(builder.is).toHaveBeenCalledWith('organizer_id', null)
    // Never returns external invitations.
    expect(builder.not).not.toHaveBeenCalledWith('organizer_id', 'is', null)
    // Hidden events are excluded from public surfaces.
    expect(builder.eq).toHaveBeenCalledWith('is_hidden', false)

    expect(result.data).toEqual(data)
  })

  it('returns upcoming events ordered ascending by start_time when scope=upcoming', async () => {
    const now = '2026-06-04T00:00:00.000Z'
    const { client, builder } = makeClient({ data: [], count: null })

    await getPublicEvents(client as any, { scope: 'upcoming', now })

    expect(builder.gte).toHaveBeenCalledWith('start_time', now)
    expect(builder.order).toHaveBeenCalledWith('start_time', { ascending: true })
  })

  it('returns past events ordered descending with pagination + exact count when scope=past', async () => {
    const now = '2026-06-04T00:00:00.000Z'
    const { client, builder } = makeClient({ data: [], count: 42 })

    const result = await getPublicEvents(client as any, {
      scope: 'past',
      now,
      range: { from: 0, to: 8 },
    })

    // Exact count is requested so the page can paginate.
    expect(builder.select.mock.calls[0][1]).toEqual({ count: 'exact' })
    expect(builder.lt).toHaveBeenCalledWith('start_time', now)
    expect(builder.order).toHaveBeenCalledWith('start_time', { ascending: false })
    expect(builder.range).toHaveBeenCalledWith(0, 8)
    expect(result.count).toBe(42)
  })
})

describe('getEventDetail', () => {
  it('fetches a single event by slug through the canonical select', async () => {
    const event = { id: '1', slug: 'my-event', title: 'Detail' }
    const { client, builder } = makeClient({ data: event })

    const result = await getEventDetail(client as any, 'my-event')

    expect(client.from).toHaveBeenCalledWith('events')
    const selectArg = builder.select.mock.calls[0][0] as string
    expect(selectArg).toContain('event_organizers(name, color_hex)')
    expect(selectArg).toContain('cities(')
    expect(builder.eq).toHaveBeenCalledWith('slug', 'my-event')
    expect(builder.single).toHaveBeenCalled()
    expect(result.data).toEqual(event)
  })
})

describe('getAdminEvents', () => {
  it('defaults to AKH events (organizer_id IS NULL) and includes hidden events', async () => {
    const { client, builder } = makeClient({ data: [], count: null })

    await getAdminEvents(client as any)

    const selectArg = builder.select.mock.calls[0][0] as string
    expect(selectArg).toContain('event_organizers(name, color_hex)')
    expect(builder.is).toHaveBeenCalledWith('organizer_id', null)
    // Admin sees hidden events too — no is_hidden filter.
    expect(builder.eq).not.toHaveBeenCalledWith('is_hidden', false)
    expect(builder.order).toHaveBeenCalledWith('start_time', { ascending: false })
  })

  it('can scope to external invitations (organizer_id IS NOT NULL)', async () => {
    const { client, builder } = makeClient({ data: [], count: null })

    await getAdminEvents(client as any, { audience: 'external' })

    expect(builder.not).toHaveBeenCalledWith('organizer_id', 'is', null)
    expect(builder.is).not.toHaveBeenCalledWith('organizer_id', null)
  })
})
