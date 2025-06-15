
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface PlaceholderTextProps {
  placeholders: string[];
  show: boolean;
}

export function PlaceholderText({ placeholders, show }: PlaceholderTextProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = () => {
    if (placeholders.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 3000);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  if (!show || placeholders.length === 0) return null;

  return (
    <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.p
          initial={{
            y: 5,
            opacity: 0,
          }}
          key={`current-placeholder-${currentPlaceholder}`}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -15,
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
            ease: "linear",
          }}
          className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
        >
          {placeholders[currentPlaceholder]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
