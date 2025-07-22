import { render, screen } from '@testing-library/react';
import App from './App';

test('renders To-Do app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/To-Do/i);
  expect(headerElement).toBeInTheDocument();
});

test('add task input should be present', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/add new task/i);
  expect(input).toBeInTheDocument();
});
