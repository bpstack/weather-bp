"use client";

interface Snowflake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

// Generate snowflakes with seeded pseudo-random values (deterministic)
const generateSnowflakes = (): Snowflake[] => {
  return Array.from({ length: 50 }, (_, i) => {
    // Use index-based pseudo-random for deterministic values
    const seed1 = (i * 7) % 100;
    const seed2 = (i * 13) % 100;
    const seed3 = (i * 17) % 100;
    const seed4 = (i * 23) % 100;
    const seed5 = (i * 31) % 100;

    return {
      id: i,
      x: seed1,
      size: (seed2 / 100) * 4 + 2,
      duration: (seed3 / 100) * 5 + 8,
      delay: (seed4 / 100) * 10,
      opacity: (seed5 / 100) * 0.6 + 0.4,
    };
  });
};

const snowflakes = generateSnowflakes();

export default function Snowfall() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-sky-400 dark:text-white drop-shadow-sm"
          style={{
            left: `${flake.x}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
          }}
        >
          ❄
        </div>
      ))}
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
