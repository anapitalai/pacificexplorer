import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../components/Header';

describe('Header Component', () => {
    test('renders the header with the correct text', () => {
        render(<Header />);
        const headerElement = screen.getByText(/header text/i);
        expect(headerElement).toBeInTheDocument();
    });

    test('contains a logo', () => {
        render(<Header />);
        const logoElement = screen.getByAltText(/logo/i);
        expect(logoElement).toBeInTheDocument();
    });
});