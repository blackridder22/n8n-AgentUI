
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Webhook } from "./types";

interface WebhookSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  webhooks: Webhook[];
  defaultWebhook: Webhook | null;
  onAddWebhook: (name: string, url: string) => void;
  onDeleteWebhook: (id: string) => void;
  onSetDefaultWebhook: (webhook: Webhook) => void;
}

export function WebhookSettingsDialog({
  isOpen,
  onOpenChange,
  webhooks,
  defaultWebhook,
  onAddWebhook,
  onDeleteWebhook,
  onSetDefaultWebhook,
}: WebhookSettingsDialogProps) {
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const handleAdd = () => {
    if (newWebhookName.trim() && newWebhookUrl.trim()) {
      onAddWebhook(newWebhookName, newWebhookUrl);
      setNewWebhookName("");
      setNewWebhookUrl("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Gérer les Webhooks</DialogTitle>
          <DialogDescription>
            Ajoutez, supprimez et définissez un webhook par défaut.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h4 className="font-semibold text-sm">Ajouter un nouveau Webhook</h4>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Mon Agent"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://votre-webhook-url.com"
            />
          </div>
          <Button onClick={handleAdd}>Ajouter Webhook</Button>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Webhooks Existants</h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {webhooks.length > 0 ? (
              webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      {webhook.name}{" "}
                      {webhook.id === defaultWebhook?.id && "(Défaut)"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {webhook.url}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {webhook.id !== defaultWebhook?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetDefaultWebhook(webhook)}
                      >
                        Par défaut
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun webhook configuré.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
