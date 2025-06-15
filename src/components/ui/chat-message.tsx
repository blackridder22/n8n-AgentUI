
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <motion.div
      className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <motion.div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 text-sm",
          isUser
            ? "bg-blue-500 text-white dark:bg-blue-600 rounded-br-none" // Added dark:bg-blue-600
            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
        )}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.2,
          delay: 0.1,
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <div className="whitespace-pre-wrap">
          <ReactMarkdown
            components={{
              strong: ({ node, ...props }) => <strong {...props} />,
              p: ({ node, ...props }) => <p className="mb-2 last:mb-0 overflow-hidden break-words" {...props} />,
            }}
          >
            {message}
          </ReactMarkdown>
        </div>

        {timestamp && (
          <p
            className={cn(
              "text-xs mt-1 opacity-70",
              isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
            )}
          >
            {timestamp.toLocaleTimeString()}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
