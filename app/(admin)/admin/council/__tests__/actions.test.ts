import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCouncilMember, updateCouncilMember, deleteCouncilMember } from '../actions'

// Mock dependencies
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path)
}))

const mockSupabase = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase))
}))

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

describe('Council Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain setup
    mockSupabase.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })
    mockSelect.mockReturnValue({
        eq: mockEq
    })
    mockEq.mockReturnValue({
        single: mockSingle,
        eq: mockEq // for delete/update chains
    })
    mockInsert.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockDelete.mockReturnValue({ eq: mockEq }) // Delete chain: delete().eq()
    
    // Fix delete chain: .delete() returns object with .eq() which resolves
    // Wait, typical chain: 
    // update: .update(data).eq(id) -> then await
    // delete: .delete().eq(id) -> then await
    
    const queryBuilder = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    }
    mockSupabase.from.mockReturnValue(queryBuilder)

    mockSelect.mockReturnValue({ eq: () => ({ single: mockSingle }) })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockDelete.mockReturnValue({ eq: mockEq })
    
    // Default auth success
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    
    // Default admin role success
    mockSingle.mockResolvedValue({ data: { role: 'admin' } })
    
    // Default success for modifying ops
    mockInsert.mockResolvedValue({ error: null })
    mockEq.mockResolvedValue({ error: null }) // This covers final await of update/delete chains
  })

  describe('createCouncilMember', () => {
    it('creates member when user is admin', async () => {
      const data = { name: 'Test', role: 'Role' }
      const result = await createCouncilMember(data)
      
      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('council_members')
      expect(mockInsert).toHaveBeenCalledWith(data)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/council')
    })

    it('throws error when user is not logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      await expect(createCouncilMember({})).rejects.toThrow('Unauthorized')
    })
    
    it('throws error when user is not admin', async () => {
       mockSingle.mockResolvedValue({ data: { role: 'user' } })
       await expect(createCouncilMember({})).rejects.toThrow('Only admins can create members')
    })
  })

  describe('updateCouncilMember', () => {
      it('updates member when user is admin', async () => {
          const data = { name: 'Updated' }
          const result = await updateCouncilMember('123', data)
          
          expect(result).toEqual({ success: true })
          expect(mockSupabase.from).toHaveBeenCalledWith('council_members')
          expect(mockUpdate).toHaveBeenCalledWith(data)
          expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/council')
      })
  })

  describe('deleteCouncilMember', () => {
      it('deletes member when user is admin', async () => {
          const result = await deleteCouncilMember('123')
          
          expect(result).toEqual({ success: true })
          expect(mockSupabase.from).toHaveBeenCalledWith('council_members')
          expect(mockDelete).toHaveBeenCalled()
          expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/council')
      })
  })
})
