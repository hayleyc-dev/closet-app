import { render } from '@testing-library/react';
import App from './App';

test('renders the app shell without crashing', () => {
  const { container } = render(<App />);
  expect(container.firstChild).toBeInTheDocument();
});
