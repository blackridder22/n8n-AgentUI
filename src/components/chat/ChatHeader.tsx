
import { RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface ChatHeaderProps {
  onNewConversation: () => void;
  isLoading: boolean;
}

export function ChatHeader({ onNewConversation, isLoading }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <h2 className="text-2xl font-semibold dark:text-white text-black">
        Ask Aceternity UI Anything
      </h2>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button
          onClick={onNewConversation}
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
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
}
