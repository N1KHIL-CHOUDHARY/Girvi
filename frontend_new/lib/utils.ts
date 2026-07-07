import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isInputFocused(): boolean {
  if (typeof document === "undefined") return false;
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  const tagName = activeElement.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    activeElement.hasAttribute("contenteditable") ||
    (activeElement as HTMLElement).isContentEditable
  );
}