/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from '@/app/page';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('Page', () => {
    it('renders the Start Learning Now link with correct href', () => {
        render(<Page />);

        const loginLink = screen.getByRole('link', { name: /Already a Member\? Log In/i });

        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login'));
    });
});