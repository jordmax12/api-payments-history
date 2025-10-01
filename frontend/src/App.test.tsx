import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // App renders successfully if no error is thrown
});

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/loading payments/i);
  expect(loadingElement).toBeInTheDocument();
});
