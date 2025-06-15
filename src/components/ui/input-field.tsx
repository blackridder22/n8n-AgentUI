
"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled: boolean;
  animating: boolean;
  isReceivingMode?: boolean;
  name?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ value, onChange, onKeyDown, disabled, animating, isReceivingMode = false, name = "message" }, ref) => {
    return (
      <input
        name={name}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={ref}
        value={value}
        type="text"
        disabled={disabled}
        readOnly={isReceivingMode}
        className={cn(
          isReceivingMode 
            ? "w-full text-sm border-none bg-transparent focus:outline-none focus:ring-0"
            : "w-full relative text-sm sm:text-base z-50 border-none h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
          animating && "text-transparent dark:text-transparent",
          isReceivingMode 
            ? "text-gray-900 dark:text-gray-100"
            : "dark:text-white bg-transparent text-black",
          disabled && "cursor-not-allowed"
        )}
      />
    );
  }
);

InputField.displayName = "InputField";
