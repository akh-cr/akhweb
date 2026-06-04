import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpolupracePage from '../page';

vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/lib/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/content')>()),
  getContentBlocks: vi.fn(),
}));

import { getContentBlocks } from '@/lib/content';

describe('SpolupracePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('renders partners list correctly', async () => {
    (getContentBlocks as any).mockResolvedValue({
        'spoluprace.header': { title: 'Spolupráce Test', subtitle: 'Subtitle', image: '/img.jpg' },
        'spoluprace.zapoj_se': { title: 'Zapoj se', text: 'Text', items: [] },
        'spoluprace.partners': {
            links: [
                { title: 'Partner 1', url: 'http://partner1.com' },
                { title: 'Partner 2', url: 'http://partner2.com' }
            ]
        }
    });

    const jsx = await SpolupracePage();
    render(jsx);

    expect(screen.getByText('Spolupráce Test')).toBeDefined();
    expect(screen.getByText('Partner 1')).toBeDefined();
    expect(screen.getByText('Partner 2')).toBeDefined();
  });
});
