"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const getInitialPosition = (): number => {
  if (typeof window === "undefined") return 80;
  const saved = localStorage.getItem("santaPositionPercent");
  return saved ? parseFloat(saved) : 80;
};

export default function Santa() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [positionPercent, setPositionPercent] =
    useState<number>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const santaRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef(0);

  // Save position to localStorage
  const savePosition = useCallback((percent: number) => {
    localStorage.setItem("santaPositionPercent", percent.toString());
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (santaRef.current) {
      const rect = santaRef.current.getBoundingClientRect();
      dragOffset.current = e.clientX - rect.left;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (santaRef.current) {
      const rect = santaRef.current.getBoundingClientRect();
      dragOffset.current = e.touches[0].clientX - rect.left;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current;
      const percent = Math.max(
        0,
        Math.min((newX / window.innerWidth) * 100, 95),
      );
      setPositionPercent(percent);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const newX = e.touches[0].clientX - dragOffset.current;
      const percent = Math.max(
        0,
        Math.min((newX / window.innerWidth) * 100, 95),
      );
      setPositionPercent(percent);
    };

    const handleEnd = () => {
      setIsDragging(false);
      savePosition(positionPercent);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, positionPercent, savePosition]);

  if (!isMounted) return null;

  return (
    <div
      ref={santaRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute -bottom-1 z-10 select-none ${isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105"} transition-transform`}
      style={{ left: `${positionPercent}%` }}
      title="Arrástrame"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Papá Noel"
        className="pointer-events-none"
      >
        {/* Legs */}
        <rect x="20" y="52" width="8" height="8" rx="2" fill="#1a1a1a" />
        <rect x="36" y="52" width="8" height="8" rx="2" fill="#1a1a1a" />

        {/* Body */}
        <rect x="16" y="36" width="32" height="18" rx="4" fill="#dc2626" />

        {/* Belt */}
        <rect x="16" y="46" width="32" height="5" fill="#1a1a1a" />
        <rect x="28" y="45" width="8" height="7" rx="1" fill="#fbbf24" />

        {/* Arms */}
        <rect x="8" y="38" width="10" height="6" rx="3" fill="#dc2626" />
        <rect x="46" y="38" width="10" height="6" rx="3" fill="#dc2626" />

        {/* Gloves */}
        <circle cx="8" cy="41" r="4" fill="#f5f5f4" />
        <circle cx="56" cy="41" r="4" fill="#f5f5f4" />

        {/* Face */}
        <circle cx="32" cy="22" r="14" fill="#fcd9b6" />

        {/* Beard */}
        <ellipse cx="32" cy="32" rx="12" ry="8" fill="#f5f5f4" />
        <ellipse cx="32" cy="28" rx="10" ry="5" fill="#f5f5f4" />

        {/* Mustache */}
        <ellipse cx="26" cy="24" rx="5" ry="2" fill="#f5f5f4" />
        <ellipse cx="38" cy="24" rx="5" ry="2" fill="#f5f5f4" />

        {/* Eyes */}
        <circle cx="27" cy="19" r="2" fill="#1a1a1a" />
        <circle cx="37" cy="19" r="2" fill="#1a1a1a" />

        {/* Eye shine */}
        <circle cx="27.5" cy="18.5" r="0.8" fill="#ffffff" />
        <circle cx="37.5" cy="18.5" r="0.8" fill="#ffffff" />

        {/* Nose */}
        <circle cx="32" cy="22" r="2.5" fill="#f4aaa0" />

        {/* Cheeks */}
        <circle cx="23" cy="23" r="2" fill="#f4a0a0" opacity="0.6" />
        <circle cx="41" cy="23" r="2" fill="#f4a0a0" opacity="0.6" />

        {/* Hat */}
        <path
          d="M18 18 Q18 8, 32 6 Q46 8, 46 18 L44 20 Q32 16, 20 20 Z"
          fill="#dc2626"
        />
        <ellipse cx="32" cy="20" rx="16" ry="3" fill="#f5f5f4" />

        {/* Hat top */}
        <path
          d="M32 6 Q38 2, 48 8"
          stroke="#dc2626"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="8" r="4" fill="#f5f5f4" />
      </svg>
    </div>
  );
}
