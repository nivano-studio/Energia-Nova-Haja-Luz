import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __isLowEnd?: boolean;
    __lowEndReasons?: string[];
  }
}

/**
 * Hook to check if the current client is classified as a low-end/slow device.
 * Helps toggle animations, heavy components, and interactive layers on/off dynamically.
 */
export function useDeviceCapabilities() {
  const [isLowEnd, setIsLowEnd] = useState<boolean>(false);
  const [reasons, setReasons] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lowEndVal = !!window.__isLowEnd;
      setIsLowEnd(lowEndVal);
      setReasons(window.__lowEndReasons || []);
    }
  }, []);

  return {
    isLowEnd,
    reasons,
  };
}
