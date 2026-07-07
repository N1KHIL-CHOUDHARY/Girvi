"use client";

import { useEffect, useRef } from "react";
import { isInputFocused } from "@/lib/utils";

interface ShortcutOptions {
  preventDefault?: boolean;
  disableOnInput?: boolean;
}

/**
 * Hook to register global keyboard shortcuts.
 * @param keys Key combination (e.g. ['Control', 'k'] or ['Alt', 'n'])
 * @param callback Callback function when combination triggers
 * @param options Configurations (preventDefault, disableOnInput)
 */
export function useKeyboardShortcut(
  keys: string[],
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  const { preventDefault = true, disableOnInput = true } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disableOnInput && isInputFocused()) {
        return;
      }

      // Check if keys match
      const keyMatches = keys.every((key) => {
        if (key === "Control" || key === "ctrl") return e.ctrlKey || e.metaKey;
        if (key === "Alt" || key === "alt") return e.altKey;
        if (key === "Shift" || key === "shift") return e.shiftKey;
        return e.key.toLowerCase() === key.toLowerCase();
      });

      if (keyMatches) {
        if (preventDefault) {
          e.preventDefault();
        }
        callbackRef.current(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, preventDefault, disableOnInput]);
}
