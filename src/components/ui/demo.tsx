"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button } from "@/components/ui/button";
// ChatMessage component is now used by ChatView
// import { ChatMessage } from "@/components/ui/chat-message";
import { useState, useRef, useEffect } from "react";
import { RefreshCw, Webhook as WebhookIcon, Settings, Trash2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WebhookManagementDialog } from "@/components/ui/webhook-management-dialog";
import { ChatView } from "@/components/ui/chat-view";


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
  const [activeWebhookOverride, setActiveWebhookOverride] =
    useState<Webhook | null>(null);

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [defaultWebhook, setDefaultWebhook] = useState<Webhook | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const storedWebhooks = localStorage.getItem("webhooks");
      const storedDefaultWebhookId = localStorage.getItem("defaultWebhookId");

      const initialWebhooks: Webhook[] = storedWebhooks
        ? JSON.parse(storedWebhooks)
        : [
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
          ];

      setWebhooks(initialWebhooks);

      if (storedDefaultWebhookId) {
        const defaultW = initialWebhooks.find(w => w.id === storedDefaultWebhookId);
        setDefaultWebhook(defaultW || initialWebhooks[0] || null);
      } else {
        setDefaultWebhook(initialWebhooks[0] || null);
      }
    } catch (error) {
      console.error("Failed to load webhooks from localStorage", error);
        const fallbackWebhooks = [
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
          ];
        setWebhooks(fallbackWebhooks);
        setDefaultWebhook(fallbackWebhooks[0]);
    }
  }, []);

  useEffect(() => {
    try {
      if (webhooks.length > 0) {
        localStorage.setItem("webhooks", JSON.stringify(webhooks));
      } else {
        localStorage.removeItem("webhooks");
      }
      if (defaultWebhook) {
        localStorage.setItem("defaultWebhookId", defaultWebhook.id);
      } else {
        localStorage.removeItem("defaultWebhookId");
      }
    } catch (error) {
        console.error("Failed to save webhooks to localStorage", error);
    }
  }, [webhooks, defaultWebhook]);


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

    if (value.startsWith("/") && !activeWebhookOverride) {
      setShowCommandPalette(true);
    } else {
      setShowCommandPalette(false);
    }
  };

  const handleSelectWebhook = (webhookName: string) => {
    const webhook = webhooks.find((w) => w.name === webhookName);
    if (webhook) {
      setActiveWebhookOverride(webhook);
    }
    setInputValue("");
    setShowCommandPalette(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageToSubmit = inputValue.trim();
    if (!messageToSubmit) return;

    let targetWebhook = activeWebhookOverride || defaultWebhook;

    if (!targetWebhook) {
      addMessage(
        "Please configure a default webhook in settings.",
        false
      );
      return;
    }

    if (messageToSubmit && targetWebhook) {
      console.log("submitted:", messageToSubmit, "to", targetWebhook.name);
      await sendToWebhook(messageToSubmit, targetWebhook.url);
      setInputValue("");
      setActiveWebhookOverride(null);
    }
  };

  const handleAddWebhook = (name: string, url: string) => {
    if (!name.trim() || !url.trim()) return;
    const newWebhook: Webhook = {
      id: `wh_${Date.now()}`,
      name: name,
      url: url,
    };
    const updatedWebhooks = [...webhooks, newWebhook];
    setWebhooks(updatedWebhooks);
    if (!defaultWebhook) {
      setDefaultWebhook(newWebhook);
    }
  };

  const handleDeleteWebhook = (id: string) => {
    const updatedWebhooks = webhooks.filter((w) => w.id !== id);
    setWebhooks(updatedWebhooks);
    if (defaultWebhook?.id === id) {
      setDefaultWebhook(updatedWebhooks[0] || null);
    }
  };

  const handleSetDefaultWebhook = (webhook: Webhook) => {
    setDefaultWebhook(webhook);
  };

  const handleClearActiveWebhook = () => {
    setActiveWebhookOverride(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAnimationComplete = () => {
    setInputValue("");
  };

  const filteredWebhooks =
    inputValue.startsWith("/") && !activeWebhookOverride
      ? webhooks.filter((w) =>
          w.name.toLowerCase().includes(inputValue.substring(1).toLowerCase())
        )
      : [];
  
  const inputRef = useRef<HTMLInputElement>(null);

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
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={isLoading}
              className="h-10 w-10"
              onClick={() => setIsDialogOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <WebhookManagementDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            webhooks={webhooks}
            defaultWebhook={defaultWebhook}
            onAddWebhook={handleAddWebhook}
            onDeleteWebhook={handleDeleteWebhook}
            onSetDefaultWebhook={handleSetDefaultWebhook}
          />
        </div>
      </div>

      {/* Chat Messages */}
      <ChatView messages={messages} messagesEndRef={messagesEndRef} />

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-border">
        <div className="relative max-w-xl mx-auto">
          {showCommandPalette && filteredWebhooks.length > 0 && (
            <div className="absolute bottom-full mb-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md z-50">
              <Command className="rounded-lg border border-border shadow-md">
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
            pill={
              activeWebhookOverride
                ? {
                    text: activeWebhookOverride.name,
                    onClear: handleClearActiveWebhook,
                  }
                : undefined
            }
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
