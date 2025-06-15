
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
} from "@/components/ui/dialog";
import { Webhook, ChatMessage as ChatMessageType } from "../chat/types";
import { ChatHeader } from "../chat/ChatHeader";
import { MessageList } from "../chat/MessageList";
import { WebhookSettingsDialog } from "../chat/WebhookSettingsDialog";
import { ChatInputArea } from "../chat/ChatInputArea";


function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function PlaceholdersAndVanishInputDemo() {
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  
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


  const handleNewConversation = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([]);
    console.log("New conversation started with sessionId:", newSessionId);
  };

  const addMessage = (message: string, isUser: boolean) => {
    const newMessage: ChatMessageType = {
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

  const handleFormSubmit = async (message: string, webhook: Webhook | null) => {
    if (!webhook) {
      addMessage(
        "Please configure a default webhook in settings.",
        false
      );
      return;
    }
    
    console.log("submitted:", message, "to", webhook.name);
    await sendToWebhook(message, webhook.url);
  };

  const handleAddWebhook = (name: string, url: string) => {
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ChatHeader onNewConversation={handleNewConversation} isLoading={isLoading} />
        <WebhookSettingsDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          webhooks={webhooks}
          defaultWebhook={defaultWebhook}
          onAddWebhook={handleAddWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          onSetDefaultWebhook={handleSetDefaultWebhook}
        />
      </Dialog>

      <MessageList messages={messages} />

      <ChatInputArea 
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        webhooks={webhooks}
        defaultWebhook={defaultWebhook}
      />
    </div>
  );
}
