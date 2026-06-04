import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactPage from '../page';

vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/content')>()),
  getContentBlocks: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getContentBlocks } from '@/lib/content';

describe('ContactPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('renders contact details correctly', async () => {
    (createClient as any).mockResolvedValue({}); // Supabase not used anymore for page fetch

    (getContentBlocks as any).mockResolvedValue({
        'kontakt.header': { title: 'Kontakt Test', subtitle: 'Subtitle', image: '/img.jpg' },
        'kontakt.details': {
            address: ['Address Line 1', 'Address Line 2'],
            email: 'test@email.com',
            bankAccount: '123/0100',
            socials: {},
            people: []
        }
    });

    const jsx = await ContactPage();
    render(jsx);

    expect(screen.getByText('Kontakt Test')).toBeDefined();
    expect(screen.getByAltText('Kontakt Test')).toBeDefined();
    expect(screen.getByText('Address Line 1')).toBeDefined();
    expect(screen.getByText('test@email.com')).toBeDefined();
    expect(screen.getByText('123/0100')).toBeDefined();
  });
});
