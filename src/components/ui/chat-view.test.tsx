import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatView } from './chat-view';
import { ChatMessage } from './demo'; // Assuming ChatMessage interface is here

// Mock ChatMessageComponent as it's a separate component
jest.mock('./chat-message', () => ({
  ChatMessage: jest.fn(({ message, isUser, timestamp }) => (
    <div data-testid="chat-message">
      <p>{message}</p>
      <p>User: {isUser.toString()}</p>
      {timestamp && <p>{timestamp.toISOString()}</p>}
    </div>
  )),
}));

const mockMessages: ChatMessage[] = [
  { id: '1', message: 'Hello', isUser: false, timestamp: new Date('2023-01-01T10:00:00Z') },
  { id: '2', message: 'Hi there', isUser: true, timestamp: new Date('2023-01-01T10:01:00Z') },
];

describe('ChatView', () => {
  const mockMessagesEndRef = React.createRef<HTMLDivElement>();

  test('renders a list of messages', () => {
    render(<ChatView messages={mockMessages} messagesEndRef={mockMessagesEndRef} />);

    const messageElements = screen.getAllByTestId('chat-message');
    expect(messageElements).toHaveLength(mockMessages.length);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('User: false')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01T10:00:00.000Z')).toBeInTheDocument();

    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.getByText('User: true')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01T10:01:00.000Z')).toBeInTheDocument();
  });

  test('displays "Start a conversation" message when no messages are provided', () => {
    render(<ChatView messages={[]} messagesEndRef={mockMessagesEndRef} />);

    expect(screen.getByText('Start a conversation by typing a message below')).toBeInTheDocument();
    expect(screen.queryAllByTestId('chat-message')).toHaveLength(0);
  });

  test('renders correct number of ChatMessage components', () => {
    const { rerender } = render(<ChatView messages={mockMessages} messagesEndRef={mockMessagesEndRef} />);
    expect(require('./chat-message').ChatMessage).toHaveBeenCalledTimes(mockMessages.length);

    const fewerMessages = [mockMessages[0]];
    rerender(<ChatView messages={fewerMessages} messagesEndRef={mockMessagesEndRef} />);
    // Called 2 times for initial render, then 1 time for rerender
    expect(require('./chat-message').ChatMessage).toHaveBeenCalledTimes(mockMessages.length + fewerMessages.length);
  });

  test('passes messagesEndRef to the div', () => {
    render(<ChatView messages={mockMessages} messagesEndRef={mockMessagesEndRef} />);
    // Check if the ref is attached to a div. This is a bit indirect.
    // A more direct way would be to check if the div element exists and if its properties can be accessed via the ref,
    // but that's harder to assert cleanly in RTL without specific content in that div.
    // For now, we ensure it runs. A common pattern is to have a specific data-testid on the ref div.
    // Let's assume the ChatView component internally has <div ref={messagesEndRef} /> as its last child in the messages list.
    // This test primarily ensures the component renders without crashing with the ref.
    expect(mockMessagesEndRef.current).toBeInTheDocument(); // Check if ref is attached to an element
  });
});
