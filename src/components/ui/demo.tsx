
"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ui/chat-message";
import { useState, useRef, useEffect } from "react";
import { RefreshCw, Webhook as WebhookIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Webhook {
  id: string;
  name: string;
  url: string;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [webhooks] = useState<Webhook[]>([
    {
      id: "searchagent",
      name: "SearchAgent",
      url: "https://2b0b-199-115-144-75.ngrok-free.app/webhook/searchagentn8n",
    },
    {
      id: "zapier",
      name: "Zapier",
      url: "https://hooks.zapier.com/hooks/catch/123456/abcde",
    },
  ]);
  const [defaultWebhook] = useState<Webhook>(webhooks[0]);

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
    console.log("New conversation started with sessionId:", newSessionId);
  };

  const addMessage = (message: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendToWebhook = async (message: string, webhookUrl: string) => {
    setIsLoading(true);

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

        let botMessage = "No response received";
        if (
          Array.isArray(responseData) &&
          responseData.length > 0 &&
          responseData[0].output
        ) {
          botMessage = responseData[0].output;
        } else if (responseData.output) {
          botMessage = responseData.output;
        } else if (typeof responseData === "string") {
          botMessage = responseData;
        }

        addMessage(botMessage, false);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending to webhook:", error);
      addMessage("Sorry, there was an error processing your message.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
    } else {
      setShowCommandPalette(false);
    }
  };

  const handleSelectWebhook = (webhookName: string) => {
    setInputValue(`/${webhookName} `);
    setShowCommandPalette(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageToSubmit = inputValue.trim();
    if (!messageToSubmit) return;

    let targetWebhook = defaultWebhook;
    let finalMessage = messageToSubmit;

    if (messageToSubmit.startsWith("/")) {
      const command = messageToSubmit.split(" ")[0].substring(1);
      const webhook = webhooks.find(
        (w) => w.name.toLowerCase() === command.toLowerCase()
      );
      if (webhook) {
        targetWebhook = webhook;
        finalMessage = messageToSubmit.substring(command.length + 2).trim();
      }
    }

    if (finalMessage.trim() && targetWebhook) {
      console.log("submitted:", finalMessage, "to", targetWebhook.name);
      await sendToWebhook(finalMessage, targetWebhook.url);
    }
  };

  const handleAnimationComplete = () => {
    setInputValue("");
  };

  const filteredWebhooks = inputValue.startsWith("/")
    ? webhooks.filter((w) =>
        w.name.toLowerCase().includes(inputValue.substring(1).toLowerCase())
      )
    : [];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold dark:text-white text-black">
          Ask Aceternity UI Anything
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="icon"
            disabled={isLoading}
            className="h-10 w-10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
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
        <div className="relative max-w-xl mx-auto">
          {showCommandPalette && filteredWebhooks.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50">
              <Command className="rounded-lg border shadow-md">
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Webhooks">
                    {filteredWebhooks.map((webhook) => (
                      <CommandItem
                        key={webhook.id}
                        onSelect={() => handleSelectWebhook(webhook.name)}
                        className="cursor-pointer"
                      >
                        <WebhookIcon className="mr-2 h-4 w-4" />
                        <span>{webhook.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
            disabled={isLoading}
            value={inputValue}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {isLoading && (
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sending message...
          </div>
        )}
      </div>
    </div>
  );
}
