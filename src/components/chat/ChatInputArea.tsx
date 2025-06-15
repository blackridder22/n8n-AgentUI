
import { useState, useRef } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Webhook as WebhookIcon } from "lucide-react";
import { Webhook } from "./types";

const placeholders = [
  "What's the first rule of Fight Club?",
  "Who is Tyler Durden?",
  "Where is Andrew Laeddis Hiding?",
  "Write a Javascript method to reverse a string",
  "How to assemble your own PC?",
];

interface ChatInputAreaProps {
  isLoading: boolean;
  onSubmit: (message: string, webhook: Webhook | null) => void;
  webhooks: Webhook[];
  defaultWebhook: Webhook | null;
}

export function ChatInputArea({
  isLoading,
  onSubmit,
  webhooks,
  defaultWebhook,
}: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeWebhookOverride, setActiveWebhookOverride] =
    useState<Webhook | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageToSubmit = inputValue.trim();
    if (!messageToSubmit) return;

    let targetWebhook = activeWebhookOverride || defaultWebhook;
    onSubmit(messageToSubmit, targetWebhook);
    setInputValue("");
    setActiveWebhookOverride(null);
  };

  const handleClearActiveWebhook = () => {
    setActiveWebhookOverride(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const filteredWebhooks =
    inputValue.startsWith("/") && !activeWebhookOverride
      ? webhooks.filter((w) =>
          w.name.toLowerCase().includes(inputValue.substring(1).toLowerCase())
        )
      : [];

  return (
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
          onSubmit={handleFormSubmit}
          disabled={isLoading}
          value={inputValue}
          onAnimationComplete={() => setInputValue("")}
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
  );
}
