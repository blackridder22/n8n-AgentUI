import React from 'react';
import { ChatMessage as ChatMessageComponent } from "@/components/ui/chat-message"; // Renaming to avoid conflict if type is also named ChatMessage

// Assuming ChatMessage interface is defined in demo.tsx or a shared types file
// If not, it should be defined here or imported from its definition location.
interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatViewProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>Start a conversation by typing a message below</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessageComponent
              key={msg.id}
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
