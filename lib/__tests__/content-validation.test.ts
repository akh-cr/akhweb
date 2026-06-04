import { describe, it, expect } from 'vitest';
import {
  validateContent,
  resolveContentBlock,
  contentBlockSchemas,
  type ContentBlockType,
} from '../content';

/**
 * Validation-on-write tests for the typed content-block module.
 *
 * For EACH declared block type: a well-formed content object passes
 * `validateContent` (returning the parsed content), and a malformed one is
 * rejected (throws). This is the contract `updateContentBlock` relies on to
 * reject malformed writes BEFORE they reach the database.
 */

describe('contentBlockSchemas', () => {
  it('declares a schema for every content-block type', () => {
    const types: ContentBlockType[] = [
      'header',
      'rich_text',
      'text_image',
      'gallery',
      'video',
      'partners',
      'contact_details',
      'text',
      'council_members',
      'materials',
    ];
    for (const type of types) {
      expect(contentBlockSchemas[type], `missing schema for ${type}`).toBeDefined();
    }
  });
});

describe('validateContent — valid content passes, malformed is rejected', () => {
  it('header: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('header', { title: 'Hi', subtitle: 'Sub', image: '/a.jpg' }),
    ).not.toThrow();
    // title is required and must be a string
    expect(() => validateContent('header', { subtitle: 'no title' })).toThrow();
    expect(() => validateContent('header', { title: 123 })).toThrow();
  });

  it('rich_text: accepts valid, rejects malformed', () => {
    expect(() => validateContent('rich_text', { content: '<p>hi</p>' })).not.toThrow();
    expect(() => validateContent('rich_text', {})).toThrow();
    expect(() => validateContent('rich_text', { content: 42 })).toThrow();
  });

  it('text_image: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('text_image', {
        title: 'T',
        text: 'body',
        image: '/x.jpg',
        items: ['a', 'b'],
        ctaText: 'go',
        ctaLink: '/go',
      }),
    ).not.toThrow();
    // text is required
    expect(() => validateContent('text_image', { title: 'only title' })).toThrow();
    // items must be strings
    expect(() => validateContent('text_image', { text: 'ok', items: [1, 2] })).toThrow();
  });

  it('gallery: accepts valid, rejects malformed', () => {
    expect(() => validateContent('gallery', { images: ['/1.jpg', '/2.jpg'] })).not.toThrow();
    expect(() => validateContent('gallery', { images: 'not-an-array' })).toThrow();
    expect(() => validateContent('gallery', {})).toThrow();
  });

  it('video: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('video', { videoId: 'abc', title: 't', description: 'd' }),
    ).not.toThrow();
    // videoId required
    expect(() => validateContent('video', { title: 'no id' })).toThrow();
    expect(() => validateContent('video', { videoId: 99 })).toThrow();
  });

  it('partners: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('partners', {
        links: [
          { title: 'A', url: 'https://a.cz' },
          { title: 'B', url: 'https://b.cz', description: 'd', secondary: { title: 'S', url: 'https://s.cz' } },
        ],
      }),
    ).not.toThrow();
    // links required
    expect(() => validateContent('partners', {})).toThrow();
    // each link needs title + url
    expect(() => validateContent('partners', { links: [{ title: 'no url' }] })).toThrow();
  });

  it('contact_details: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('contact_details', {
        address: ['Line 1', 'Line 2'],
        email: 'info@x.cz',
        bankAccount: '123/456',
        variableSymbol: '777',
        socials: { facebook: 'https://fb', instagram: 'https://ig' },
        people: [{ name: 'Jan', role: 'Coord', phone: '123', email: 'j@x.cz', image: 'JN' }],
      }),
    ).not.toThrow();
    // email required
    expect(() =>
      validateContent('contact_details', {
        address: ['a'],
        bankAccount: '1',
        socials: {},
        people: [],
      }),
    ).toThrow();
    // people entries need name + role
    expect(() =>
      validateContent('contact_details', {
        address: ['a'],
        email: 'e@x.cz',
        bankAccount: '1',
        socials: {},
        people: [{ name: 'no role' }],
      }),
    ).toThrow();
  });

  it('text: accepts valid, rejects malformed', () => {
    expect(() => validateContent('text', { text: 'hi', items: ['a'] })).not.toThrow();
    expect(() => validateContent('text', { items: ['a'] })).toThrow();
    expect(() => validateContent('text', { text: 5 })).toThrow();
  });

  it('council_members: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('council_members', {
        title: 'Rada',
        subtitle: 'sub',
        councilMemberIds: ['1', '2'],
      }),
    ).not.toThrow();
    // title required
    expect(() => validateContent('council_members', { councilMemberIds: [] })).toThrow();
    // ids must be strings
    expect(() =>
      validateContent('council_members', { title: 'Rada', councilMemberIds: [1, 2] }),
    ).toThrow();
  });

  it('materials: accepts valid, rejects malformed', () => {
    expect(() =>
      validateContent('materials', {
        title: 'Mat',
        description: 'd',
        items: [{ title: 'a', url: 'https://a', description: 'x', icon: 'Home' }],
      }),
    ).not.toThrow();
    // title + items required
    expect(() => validateContent('materials', { description: 'no title/items' })).toThrow();
    // each item needs title + url
    expect(() =>
      validateContent('materials', { title: 'Mat', items: [{ title: 'no url' }] }),
    ).toThrow();
  });

  it('rejects an unknown block type', () => {
    expect(() =>
      validateContent('not_a_type' as ContentBlockType, { anything: true }),
    ).toThrow();
  });

  it('returns the parsed content for valid input', () => {
    const parsed = validateContent('header', { title: 'Hi' });
    expect(parsed).toEqual({ title: 'Hi' });
  });
});

describe('resolveContentBlock — render-by-type entry point with per-type fallback', () => {
  it('returns the stored content when present (valid blocks unchanged)', () => {
    const stored = { title: 'Stored', subtitle: 'Sub', image: '/s.jpg' };
    const fallback = { title: 'Fallback', subtitle: 'fb', image: '/fb.jpg' };
    expect(resolveContentBlock('header', stored, fallback)).toEqual(stored);
  });

  it('returns the fallback when the block is missing', () => {
    const fallback = { title: 'Fallback', subtitle: 'fb', image: '/fb.jpg' };
    expect(resolveContentBlock('header', undefined, fallback)).toEqual(fallback);
    expect(resolveContentBlock('header', null, fallback)).toEqual(fallback);
  });

  it('resolves text_image with its fallback', () => {
    const fallback = { title: 'Zapoj se', text: 'Přidej se.', items: [] };
    expect(resolveContentBlock('text_image', undefined, fallback)).toEqual(fallback);
    const stored = { text: 'real', items: ['x'] };
    expect(resolveContentBlock('text_image', stored, fallback)).toEqual(stored);
  });

  it('resolves materials with its fallback', () => {
    const fallback = { title: 'Pro vedoucí', description: 'd', items: [] };
    expect(resolveContentBlock('materials', undefined, fallback)).toEqual(fallback);
  });
});
