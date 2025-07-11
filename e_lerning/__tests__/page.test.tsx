import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'

describe('Page', () => {
    // it('renders a heading', () => {
    //     render(<Page />)
    //
    //     const heading = screen.getByRole('heading', { level: 1 })
    //
    //     expect(heading).toBeInTheDocument()
    // })

    it('renders the Start Learning Now link with correct href', () => {
        render(<Page />);

        const deployLink = screen.getByRole('link', { name: /Start Learning Now/i });

        expect(deployLink).toBeInTheDocument();
        expect(deployLink).toHaveAttribute('href', expect.stringContaining('/signup'));
    });
})