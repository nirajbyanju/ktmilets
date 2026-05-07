import { useEffect, useState } from "react";

export const useDebouncedValue = <TValue>(value: TValue, delayMs: number): TValue => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
};
