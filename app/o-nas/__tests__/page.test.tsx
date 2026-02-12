import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/components/team-section', () => ({ TeamSection: () => <div data-testid="team-section">Team</div> }));
vi.mock('@/lib/content', () => ({ getContentBlocks: vi.fn() }));

import { getContentBlocks } from '@/lib/content';

describe('AboutPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('renders about content correctly', async () => {
    (getContentBlocks as any).mockResolvedValue({
        'o-nas.header': { title: 'O nás Test', subtitle: 'Subtitle', image: '/img.jpg' },
        'o-nas.content': { content: '<p>About Content</p>' }
    });

    const jsx = await AboutPage();
    render(jsx);

    expect(screen.getByText('O nás Test')).toBeDefined();
    expect(screen.getByText('About Content')).toBeDefined(); // dangerouslySetInnerHTML renders this
    expect(screen.getByTestId('team-section')).toBeDefined();
    expect(screen.getByAltText('O nás Test')).toBeDefined();
  });
});
