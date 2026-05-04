import { useRef } from "react";

export function useSwipe(onLeft: () => void, onRight: () => void, threshold = 50) {
  const startX = useRef<number | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      if (dx > threshold) onRight();
      else if (dx < -threshold) onLeft();
      startX.current = null;
    },
  };
}
