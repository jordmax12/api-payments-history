import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app container', () => {
  render(<App />);
  const appElement = document.querySelector('.App');
  expect(appElement).toBeInTheDocument();
});

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/loading payments/i);
  expect(loadingElement).toBeInTheDocument();
});
