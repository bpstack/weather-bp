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

interface DraggableKingProps {
  id: string;
  defaultPosition: number;
  children: React.ReactNode;
  label: string;
}

function DraggableKing({
  id,
  defaultPosition,
  children,
  label,
}: DraggableKingProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const getInitialPosition = (): number => {
    if (typeof window === "undefined") return defaultPosition;
    const saved = localStorage.getItem(`${id}PositionPercent`);
    return saved ? parseFloat(saved) : defaultPosition;
  };

  const [positionPercent, setPositionPercent] =
    useState<number>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const kingRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef(0);

  const savePosition = useCallback(
    (percent: number) => {
      localStorage.setItem(`${id}PositionPercent`, percent.toString());
    },
    [id],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (kingRef.current) {
      const rect = kingRef.current.getBoundingClientRect();
      dragOffset.current = e.clientX - rect.left;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    if (kingRef.current) {
      const rect = kingRef.current.getBoundingClientRect();
      dragOffset.current = e.touches[0].clientX - rect.left;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current;
      const percent = Math.max(
        0,
        Math.min((newX / window.innerWidth) * 100, 92),
      );
      setPositionPercent(percent);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const newX = e.touches[0].clientX - dragOffset.current;
      const percent = Math.max(
        0,
        Math.min((newX / window.innerWidth) * 100, 92),
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
      ref={kingRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute -bottom-2 z-10 select-none ${isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105"} transition-transform`}
      style={{ left: `${positionPercent}%` }}
      title={`Arrástrame - ${label}`}
    >
      {children}
    </div>
  );
}

// Camel SVG component
function Camel() {
  return (
    <g>
      {/* Camel body */}
      <ellipse cx="32" cy="52" rx="20" ry="10" fill="#d4a574" />

      {/* Hump */}
      <ellipse cx="32" cy="44" rx="8" ry="6" fill="#c9986c" />

      {/* Neck */}
      <path
        d="M48 48 Q56 40, 54 28 Q52 24, 50 24 Q48 24, 48 28 Q46 40, 48 48"
        fill="#d4a574"
      />

      {/* Head */}
      <ellipse cx="52" cy="22" rx="6" ry="4" fill="#d4a574" />

      {/* Snout */}
      <ellipse cx="58" cy="23" rx="4" ry="3" fill="#c9986c" />

      {/* Eye */}
      <circle cx="52" cy="20" r="1.5" fill="#1a1a1a" />

      {/* Ear */}
      <ellipse cx="48" cy="18" rx="2" ry="3" fill="#c9986c" />

      {/* Front legs */}
      <rect x="42" y="58" width="4" height="14" rx="2" fill="#c9986c" />
      <rect x="48" y="58" width="4" height="14" rx="2" fill="#c9986c" />

      {/* Back legs */}
      <rect x="16" y="58" width="4" height="14" rx="2" fill="#c9986c" />
      <rect x="22" y="58" width="4" height="14" rx="2" fill="#c9986c" />

      {/* Hooves */}
      <rect x="42" y="70" width="4" height="3" rx="1" fill="#5c4033" />
      <rect x="48" y="70" width="4" height="3" rx="1" fill="#5c4033" />
      <rect x="16" y="70" width="4" height="3" rx="1" fill="#5c4033" />
      <rect x="22" y="70" width="4" height="3" rx="1" fill="#5c4033" />

      {/* Tail */}
      <path
        d="M12 50 Q6 54, 8 60"
        stroke="#8b6914"
        strokeWidth="2"
        fill="none"
      />
      <ellipse cx="8" cy="62" rx="2" ry="3" fill="#8b6914" />

      {/* Saddle blanket */}
      <rect x="22" y="38" width="20" height="12" rx="2" fill="#dc2626" />
      <rect x="24" y="40" width="16" height="8" rx="1" fill="#fbbf24" />
    </g>
  );
}

// Melchor on camel - Purple robe, gold crown, white beard (elder)
function MelchorOnCamel() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 70 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Melchor en camello"
      className="pointer-events-none"
    >
      <Camel />

      {/* King sitting on camel */}
      <g transform="translate(18, -10)">
        {/* Robe/body */}
        <path d="M8 32 L24 32 L26 48 L6 48 Z" fill="#7c3aed" />
        <path d="M8 32 L24 32 L23 38 L9 38 Z" fill="#8b5cf6" />

        {/* Arms */}
        <rect x="4" y="34" width="6" height="4" rx="2" fill="#7c3aed" />
        <rect x="22" y="34" width="6" height="4" rx="2" fill="#7c3aed" />

        {/* Hands */}
        <circle cx="3" cy="36" r="2.5" fill="#fcd9b6" />
        <circle cx="29" cy="36" r="2.5" fill="#fcd9b6" />

        {/* Gift */}
        <rect x="0" y="32" width="6" height="6" rx="1" fill="#fbbf24" />
        <rect x="2" y="32" width="2" height="6" fill="#f59e0b" />

        {/* Face */}
        <circle cx="16" cy="20" r="8" fill="#fcd9b6" />

        {/* Beard */}
        <ellipse cx="16" cy="26" rx="6" ry="4" fill="#f5f5f4" />

        {/* Eyes */}
        <circle cx="14" cy="18" r="1.2" fill="#1a1a1a" />
        <circle cx="18" cy="18" r="1.2" fill="#1a1a1a" />

        {/* Crown */}
        <path
          d="M8 14 L10 8 L13 12 L16 6 L19 12 L22 8 L24 14 Z"
          fill="#fbbf24"
        />
        <rect x="8" y="12" width="16" height="3" fill="#fbbf24" />
        <circle cx="12" cy="14" r="1" fill="#dc2626" />
        <circle cx="16" cy="12" r="1" fill="#22c55e" />
        <circle cx="20" cy="14" r="1" fill="#3b82f6" />
      </g>
    </svg>
  );
}

// Gaspar on camel - Green robe, silver crown, brown beard
function GasparOnCamel() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 70 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Gaspar en camello"
      className="pointer-events-none"
    >
      <Camel />

      {/* King sitting on camel */}
      <g transform="translate(18, -10)">
        {/* Robe/body */}
        <path d="M8 32 L24 32 L26 48 L6 48 Z" fill="#059669" />
        <path d="M8 32 L24 32 L23 38 L9 38 Z" fill="#10b981" />

        {/* Arms */}
        <rect x="4" y="34" width="6" height="4" rx="2" fill="#059669" />
        <rect x="22" y="34" width="6" height="4" rx="2" fill="#059669" />

        {/* Hands */}
        <circle cx="3" cy="36" r="2.5" fill="#fcd9b6" />
        <circle cx="29" cy="36" r="2.5" fill="#fcd9b6" />

        {/* Gift (frankincense) */}
        <rect x="26" y="32" width="7" height="8" rx="1" fill="#a78bfa" />
        <rect x="26" y="32" width="7" height="2" rx="1" fill="#c4b5fd" />

        {/* Face */}
        <circle cx="16" cy="20" r="8" fill="#fcd9b6" />

        {/* Beard */}
        <ellipse cx="16" cy="25" rx="5" ry="3" fill="#92400e" />

        {/* Eyes */}
        <circle cx="14" cy="18" r="1.2" fill="#1a1a1a" />
        <circle cx="18" cy="18" r="1.2" fill="#1a1a1a" />

        {/* Crown */}
        <path d="M8 14 L11 9 L16 12 L21 9 L24 14 Z" fill="#e5e7eb" />
        <rect x="8" y="12" width="16" height="3" fill="#d1d5db" />
        <circle cx="16" cy="14" r="1.5" fill="#fbbf24" />
      </g>
    </svg>
  );
}

// Baltasar on camel - Red robe, bronze crown, dark skin
function BaltasarOnCamel() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 70 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Baltasar en camello"
      className="pointer-events-none"
    >
      <Camel />

      {/* King sitting on camel */}
      <g transform="translate(18, -10)">
        {/* Robe/body */}
        <path d="M8 32 L24 32 L26 48 L6 48 Z" fill="#dc2626" />
        <path d="M8 32 L24 32 L23 38 L9 38 Z" fill="#ef4444" />

        {/* Arms */}
        <rect x="4" y="34" width="6" height="4" rx="2" fill="#dc2626" />
        <rect x="22" y="34" width="6" height="4" rx="2" fill="#dc2626" />

        {/* Hands */}
        <circle cx="3" cy="36" r="2.5" fill="#8b6914" />
        <circle cx="29" cy="36" r="2.5" fill="#8b6914" />

        {/* Gift (myrrh jar) */}
        <ellipse cx="2" cy="36" rx="3" ry="4" fill="#78716c" />
        <ellipse cx="2" cy="33" rx="2" ry="1.5" fill="#a8a29e" />

        {/* Face */}
        <circle cx="16" cy="20" r="8" fill="#8b6914" />

        {/* Beard */}
        <ellipse cx="16" cy="24" rx="4" ry="2.5" fill="#1a1a1a" />

        {/* Eyes */}
        <circle cx="14" cy="18" r="1.2" fill="#1a1a1a" />
        <circle cx="18" cy="18" r="1.2" fill="#1a1a1a" />

        {/* Eye shine */}
        <circle cx="14.3" cy="17.7" r="0.4" fill="#ffffff" />
        <circle cx="18.3" cy="17.7" r="0.4" fill="#ffffff" />

        {/* Crown */}
        <rect x="8" y="9" width="16" height="6" rx="2" fill="#d97706" />
        <rect x="10" y="7" width="3" height="3" fill="#d97706" />
        <rect x="19" y="7" width="3" height="3" fill="#d97706" />
        <circle cx="16" cy="12" r="1.5" fill="#fbbf24" />
      </g>
    </svg>
  );
}

export default function WiseMen() {
  return (
    <>
      <DraggableKing id="melchor" defaultPosition={5} label="Melchor">
        <MelchorOnCamel />
      </DraggableKing>
      <DraggableKing id="gaspar" defaultPosition={40} label="Gaspar">
        <GasparOnCamel />
      </DraggableKing>
      <DraggableKing id="baltasar" defaultPosition={75} label="Baltasar">
        <BaltasarOnCamel />
      </DraggableKing>
    </>
  );
}
