import { useEffect, useState } from "react";

/**
 * useDebounce
 * Delays updating the value until after delay ms
 *
 * @param value - any changing value (search input)
 * @param delay - milliseconds to wait
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup previous timer on value change
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
