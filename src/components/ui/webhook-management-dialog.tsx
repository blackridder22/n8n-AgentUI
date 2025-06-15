import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

// Assuming Webhook interface is defined in demo.tsx or a shared types file
// If not, it should be defined here or imported from its definition location.
interface Webhook {
  id: string;
  name: string;
  url: string;
}

interface WebhookManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhooks: Webhook[];
  defaultWebhook: Webhook | null;
  onAddWebhook: (name: string, url: string) => void;
  onDeleteWebhook: (id: string) => void;
  onSetDefaultWebhook: (webhook: Webhook) => void;
}

export const WebhookManagementDialog: React.FC<WebhookManagementDialogProps> = ({
  open,
  onOpenChange,
  webhooks,
  defaultWebhook,
  onAddWebhook,
  onDeleteWebhook,
  onSetDefaultWebhook,
}) => {
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const handleAddWebhook = () => {
    if (newWebhookName && newWebhookUrl) {
      onAddWebhook(newWebhookName, newWebhookUrl);
      setNewWebhookName("");
      setNewWebhookUrl("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogTrigger will be in the parent component (demo.tsx) */}
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Manage Webhooks</DialogTitle>
          <DialogDescription>
            Add, remove, or set a default webhook for your notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-webhook-name" className="text-right">
              Name
            </Label>
            <Input
              id="new-webhook-name"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
              className="col-span-3"
              placeholder="Webhook Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-webhook-url" className="text-right">
              URL
            </Label>
            <Input
              id="new-webhook-url"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="col-span-3"
              placeholder="Webhook URL"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddWebhook}>Add Webhook</Button>
        </DialogFooter>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Existing Webhooks</h3>
          {webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No webhooks configured.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {webhooks.map((webhook) => (
                <li
                  key={webhook.id}
                  className="flex items-center justify-between p-2 border border-border rounded-md" // Added border-border
                >
                  <div className="flex-grow overflow-hidden mr-2">
                    <span className="font-medium block truncate">{webhook.name}</span> {/* Added block and truncate */}
                    <span className="text-sm text-muted-foreground ml-0 block truncate">({webhook.url})</span> {/* Removed ml-2, Added block and truncate */}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetDefaultWebhook(webhook)}
                      disabled={defaultWebhook?.id === webhook.id}
                    >
                      {defaultWebhook?.id === webhook.id ? "Default" : "Set as Default"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
