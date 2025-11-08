import React from 'react';
import { render, screen } from '@testing-library/react';
import ExampleComponent from '../ExampleComponent';

test('renders hello world', () => {
  render(<ExampleComponent />);
  const linkElement = screen.getByText(/hello world/i);
  expect(linkElement).toBeInTheDocument();
});