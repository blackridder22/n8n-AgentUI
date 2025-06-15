import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaceholdersAndVanishInputDemo } from './demo';

// Mock child components that are not the focus of this specific test
// and might have their own complex dependencies (like framer-motion or icons)

jest.mock('./placeholders-and-vanish-input', () => ({
  PlaceholdersAndVanishInput: jest.fn((props) => (
    <input
      data-testid="placeholders-input"
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled}
      placeholder={props.placeholders[0]}
    />
  )),
}));

jest.mock('./webhook-management-dialog', () => ({
  WebhookManagementDialog: jest.fn(() => <div data-testid="webhook-dialog">Webhook Dialog</div>),
}));

jest.mock('./chat-view', () => ({
  ChatView: jest.fn(({ messages }) => (
    <div data-testid="chat-view">
      {messages.map((msg: any) => (
        <div key={msg.id}>{msg.message}</div>
      ))}
    </div>
  )),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  RefreshCw: (props: any) => <svg data-testid="refresh-icon" {...props} />,
  Settings: (props: any) => <svg data-testid="settings-icon" {...props} />,
  WebhookIcon: (props: any) => <svg data-testid="webhook-lucide-icon" {...props} />,
  // Add other icons used by demo.tsx if any, e.g. Trash2 if not handled by WebhookManagementDialog mock
}));


// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('PlaceholdersAndVanishInputDemo (Demo Page)', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset body classes
    document.body.className = '';
    document.documentElement.className = '';
     // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ output: 'Mocked response' }),
      })
    ) as jest.Mock;
  });

  test('renders the demo page structure', () => {
    render(<PlaceholdersAndVanishInputDemo />);
    expect(screen.getByText('Ask Aceternity UI Anything')).toBeInTheDocument();
    expect(screen.getByTestId('placeholders-input')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  test('conceptual dark mode: main background div should have dark classes when dark class is on html', () => {
    // Add 'dark' class to the html element to simulate dark mode
    document.documentElement.classList.add('dark');

    render(<PlaceholdersAndVanishInputDemo />);

    // Find the main background div. Assuming it's the outermost div of the component.
    // This is a bit fragile; a data-testid would be better.
    // For now, we get it by a known text content and go up to its parent container if needed,
    // or rely on its direct Tailwind classes if it's the root.
    // The component's root div has "h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"

    const mainDiv = screen.getByText('Ask Aceternity UI Anything').closest('.h-screen.flex.flex-col');

    expect(mainDiv).toHaveClass('dark:from-slate-900');
    expect(mainDiv).toHaveClass('dark:to-slate-800');

    // Clean up the class from html element
    document.documentElement.classList.remove('dark');
  });

  test('header should have dark classes when dark class is on html', () => {
    document.documentElement.classList.add('dark');
    render(<PlaceholdersAndVanishInputDemo />);
    const headerDiv = screen.getByText('Ask Aceternity UI Anything').parentElement; // The h2's parent is the header div
    expect(headerDiv).toHaveClass('dark:bg-gray-900/50');
    document.documentElement.classList.remove('dark');
  });

  test('input area wrapper should have dark classes when dark class is on html', () => {
    document.documentElement.classList.add('dark');
    render(<PlaceholdersAndVanishInputDemo />);
    // The input area is the parent of the div that contains the mocked PlaceholdersAndVanishInput
    const inputWrapper = screen.getByTestId('placeholders-input').closest('.p-4');
    expect(inputWrapper).toHaveClass('dark:bg-gray-900/50');
    expect(inputWrapper).toHaveClass('border-border'); // Check for the border update
    document.documentElement.classList.remove('dark');
  });

});
