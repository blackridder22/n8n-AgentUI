
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useVanishAnimation } from "./vanish-animation";
import { PlaceholderText } from "./placeholder-text";
import { SubmitButton } from "./submit-button";
import { InputField } from "./input-field";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  disabled = false,
  botResponse = "",
  onBotResponseComplete,
  isReceivingMode = false,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  botResponse?: string;
  onBotResponseComplete?: () => void;
  isReceivingMode?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const [showingBotResponse, setShowingBotResponse] = useState(false);

  const { canvasRef, newDataRef, draw, animate } = useVanishAnimation();

  useEffect(() => {
    if (botResponse && !showingBotResponse && isReceivingMode) {
      setShowingBotResponse(true);
      setValue(botResponse);
      
      setTimeout(() => {
        vanishBotResponse();
      }, 2000);
    }
  }, [botResponse, isReceivingMode]);

  useEffect(() => {
    draw(value, inputRef);
  }, [value, draw]);

  const vanishBotResponse = () => {
    setAnimating(true);
    draw(value, inputRef);

    if (inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX, () => {
        setValue("");
        setAnimating(false);
        setShowingBotResponse(false);
        onBotResponseComplete?.();
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !animating && !disabled && !showingBotResponse && !isReceivingMode) {
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    if (disabled || showingBotResponse || isReceivingMode) return;
    
    setAnimating(true);
    draw(value, inputRef);

    const currentValue = inputRef.current?.value || "";
    if (currentValue && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX, () => {
        setValue("");
        setAnimating(false);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled || showingBotResponse || isReceivingMode) return;
    
    vanishAndSubmit();
    onSubmit && onSubmit(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!animating && !disabled) {
      setValue(e.target.value);
      onChange && onChange(e);
    }
  };

  // For receiving mode, render a simplified version without form wrapper
  if (isReceivingMode) {
    return (
      <div className="w-full relative">
        <canvas
          className={cn(
            "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 origin-top-left filter invert dark:invert-0",
            !animating ? "opacity-0" : "opacity-100"
          )}
          ref={canvasRef}
        />
        <InputField
          ref={inputRef}
          value={showingBotResponse ? botResponse : value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={true}
          animating={animating}
          isReceivingMode={true}
          name="botResponse"
        />
      </div>
    );
  }

  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value 
          ? "bg-gray-50 dark:bg-zinc-800" 
          : "bg-white dark:bg-zinc-800",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20",
          !animating ? "opacity-0" : "opacity-100"
        )}
        ref={canvasRef}
      />
      
      <InputField
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        animating={animating}
        isReceivingMode={false}
      />

      <SubmitButton disabled={!value || disabled} hasValue={!!value} />

      <PlaceholderText placeholders={placeholders} show={!value} />
    </form>
  );
}
