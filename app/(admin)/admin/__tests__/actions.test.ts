import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPost, getPosts } from '../posts/actions';
import { createEvent } from '../events/actions';
import { createCouncilMember } from '../council/actions';

// Mock dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/utils', () => ({
  slugify: vi.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock Supabase
const mockInsert = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSingle = vi.fn();
const mockFrom = vi.fn().mockReturnValue({
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  single: mockSingle,
});

const mockAuthGetUser = vi.fn();
const mockRpc = vi.fn();
const mockSupabase = {
  from: mockFrom,
  auth: {
    getUser: mockAuthGetUser,
  },
  rpc: mockRpc,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock guards for Events
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({
      supabase: mockSupabase,
      user: { id: 'admin-user-id' }
  })),
  requireEventAccess: vi.fn(() => Promise.resolve({
      supabase: mockSupabase,
      user: { id: 'admin-user-id' },
      role: 'admin',
      organizerId: null,
  })),
}));

describe('Admin Creation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default success responses
    mockInsert.mockResolvedValue({ error: null });
    mockAuthGetUser.mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
    });
    // Mock admin role check for Council
    mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null })
        })
    });
  });

  describe('createPost', () => {
    it('should create a post successfully without redirect error', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test Content',
        excerpt: 'Test Excerpt',
        published_at: new Date().toISOString(),
        is_hidden: false,
        image_url: 'http://example.com/image.jpg',
        slug: 'test-post' // explicit slug
      };

      await createPost(postData);

      expect(mockFrom).toHaveBeenCalledWith('posts');
      // author_id now comes from the shared requireAdmin guard's user, which the
      // mock above resolves to 'admin-user-id'.
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Post',
        author_id: 'admin-user-id'
      }));
      // Ensure revalidatePath was called
      const { revalidatePath } = await import('next/cache');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/posts');
    });

    it('should auto-generate slug for post if missing', async () => {
        const postData = {
            title: 'Auto Slug Post',
            content: 'Content',
            excerpt: 'Excerpt',
            published_at: null,
            is_hidden: true,
            image_url: null,
            slug: '' // missing slug
        };

        await createPost(postData);

        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            slug: 'auto-slug-post'
        }));
    });
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        content: 'Test Content',
        start_time: new Date().toISOString(),
        location: 'Test Location',
        city_id: 'city-id',
        slug: 'test-event',
        image_url: null,
        gallery_images: [],
        registration_link: null,
        facebook_event_link: null,
        news_publish_date: null,
        is_hidden: false
      };

      await createEvent(eventData);

      expect(mockFrom).toHaveBeenCalledWith('events');
      // Admin without an explicit organizer creates an AKH event (organizer_id null).
      expect(mockInsert).toHaveBeenCalledWith({ ...eventData, organizer_id: null });
      const { revalidatePath } = await import('next/cache');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/events');
    });

     it('should auto-generate slug for event if missing', async () => {
        const eventData = {
            title: 'Auto Slug Event',
            description: 'Desc',
            content: null,
            start_time: new Date().toISOString(),
            location: 'Loc',
            city_id: null,
            slug: '', // missing
            image_url: null,
            gallery_images: [],
            registration_link: null,
            facebook_event_link: null,
            news_publish_date: null,
            is_hidden: false
        };

        await createEvent(eventData);

        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            slug: 'auto-slug-event'
        }));
    });
  });

  describe('createCouncilMember', () => {
    it('should create a council member successfully', async () => {
      const memberData = {
        name: 'Test Member',
        role: 'Test Role',
        bio: 'Test Bio',
        image_url: null,
        priority: 1,
        active: true
      };

      // Ensure mock for role check logic in createCouncilMember
      // It selects generic 'user_roles' first
      mockFrom.mockImplementation((table) => {
          if (table === 'user_roles') {
              return {
                  select: vi.fn().mockReturnThis(),
                  eq: vi.fn().mockReturnThis(),
                  single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null })
              }
          }
          if (table === 'council_members') {
              return {
                  insert: mockInsert
              }
          }
          return { select: vi.fn() }
      });


      await createCouncilMember(memberData);

      expect(mockInsert).toHaveBeenCalledWith(memberData);
      const { revalidatePath } = await import('next/cache');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/council');
    });
  });

  describe('getPosts', () => {
    it('should fetch posts using get_admin_news_feed RPC', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          excerpt: 'Excerpt 1',
          published_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          image_url: 'img1.jpg',
          author_id: 'user1',
          is_hidden: false,
          type: 'post'
        },
        {
          id: '2',
          title: 'Event 1',
          slug: 'event-1',
          excerpt: 'Desc 1',
          published_at: null, // Draft
          created_at: '2023-02-01T00:00:00Z',
          updated_at: '2023-02-01T00:00:00Z',
          image_url: 'img2.jpg',
          author_id: null,
          is_hidden: true,
          type: 'event'
        }
      ];

      mockRpc.mockResolvedValue({ data: mockData, error: null });

      const results = await getPosts();

      expect(mockRpc).toHaveBeenCalledWith('get_admin_news_feed', {
        p_limit: 100,
        p_offset: 0
      });

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Post 1');
      expect(results[0].type).toBe('post');
      expect(results[1].title).toBe('Event 1');
      expect(results[1].type).toBe('event');
      expect(results[1].author_id).toBe(''); // Should handle null author_id
    });
  });
});
