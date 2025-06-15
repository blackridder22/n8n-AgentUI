
"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ui/chat-message";
import { useState, useRef, useEffect } from "react";
import { MessageCirclePlus } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function PlaceholdersAndVanishInputDemo() {
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [botResponse, setBotResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([]);
    setBotResponse("");
    console.log("New conversation started with sessionId:", newSessionId);
  };

  const addMessage = (message: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendToWebhook = async (message: string) => {
    setIsLoading(true);
    const webhookUrl = "https://2b0b-199-115-144-75.ngrok-free.app/webhook/searchagentn8n";
    
    // Add user message to chat
    addMessage(message, true);
    
    try {
      console.log("Sending to webhook:", { chatInput: message, sessionId });
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: message,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Webhook response:", responseData);
        
        // Extract message from response and trigger bot response animation
        let botMessage = "No response received";
        if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
          botMessage = responseData[0].output;
        } else if (responseData.output) {
          botMessage = responseData.output;
        } else if (typeof responseData === 'string') {
          botMessage = responseData;
        }
        
        // Set bot response to trigger animation
        setBotResponse(botMessage);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending to webhook:", error);
      setBotResponse("Sorry, there was an error processing your message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBotResponseComplete = () => {
    // Add bot message to chat when animation completes
    if (botResponse) {
      addMessage(botResponse, false);
      setBotResponse("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    
    if (message.trim()) {
      console.log("submitted:", message);
      await sendToWebhook(message.trim());
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold dark:text-white text-black">
          Ask Aceternity UI Anything
        </h2>
        <Button 
          onClick={handleNewConversation}
          variant="outline"
          size="icon"
          disabled={isLoading}
          className="h-10 w-10"
        >
          <MessageCirclePlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
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

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
          disabled={isLoading}
          botResponse={botResponse}
          onBotResponseComplete={handleBotResponseComplete}
        />
        
        {isLoading && (
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sending message...
          </div>
        )}
      </div>
    </div>
  );
}
