
"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function PlaceholdersAndVanishInputDemo() {
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleNewConversation = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    console.log("New conversation started with sessionId:", newSessionId);
    toast({
      title: "New Conversation",
      description: "Started a new conversation session",
    });
  };

  const sendToWebhook = async (message: string) => {
    setIsLoading(true);
    const webhookUrl = "https://2b0b-199-115-144-75.ngrok-free.app/webhook/searchagentn8n";
    
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
        const responseData = await response.text();
        console.log("Webhook response:", responseData);
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending to webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send message to webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    <div className="h-[40rem] flex flex-col justify-center items-center px-4">
      <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
        Ask Aceternity UI Anything
      </h2>
      
      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Session ID: <span className="font-mono text-xs">{sessionId}</span>
        </div>
        <Button 
          onClick={handleNewConversation}
          variant="outline"
          disabled={isLoading}
        >
          New Conversation
        </Button>
      </div>

      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
      
      {isLoading && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Sending message...
        </div>
      )}
    </div>
  );
}
