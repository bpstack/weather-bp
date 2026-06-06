"use client";

import { useMemo } from "react";

let _uid = 0;
const nextId = () => `wx${++_uid}`;

interface SunProps {
  id: string;
  cx?: number;
  cy?: number;
  r?: number;
  rays?: boolean;
}

function Sun({ id, cx = 50, cy = 50, r = 17, rays = true }: SunProps) {
  const rayEls: React.ReactNode[] = [];
  if (rays) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const inner = r + 6;
      const outer = r + 13;
      rayEls.push(
        <line
          key={i}
          x1={cx + Math.cos(a) * inner}
          y1={cy + Math.sin(a) * inner}
          x2={cx + Math.cos(a) * outer}
          y2={cy + Math.sin(a) * outer}
          stroke={`url(#${id}-ray)`}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      );
    }
  }
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-core`} cx="42%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="45%" stopColor="#FFD64B" />
          <stop offset="100%" stopColor="#F5A01E" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#FFD64B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFD64B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#F5A01E" />
        </linearGradient>
      </defs>
      <circle className="wx-glow" cx={cx} cy={cy} r={r + 13} fill={`url(#${id}-halo)`} />
      {rays && (
        /* transform-origin + transform-box required so rays rotate around sun center, not SVG origin */
        <g
          className="wx-spin"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transformBox: "view-box" as React.CSSProperties["transformBox"],
          }}
        >
          {rayEls}
        </g>
      )}
      <circle
        className="wx-pulse"
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${id}-core)`}
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transformBox: "view-box" as React.CSSProperties["transformBox"],
        }}
      />
      <circle cx={cx - r * 0.32} cy={cy - r * 0.36} r={r * 0.42} fill="#FFFBEB" opacity="0.5" />
    </g>
  );
}

interface MoonProps {
  id: string;
  cx?: number;
  cy?: number;
  r?: number;
}

function Moon({ id, cx = 50, cy = 48, r = 16 }: MoonProps) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-mhalo`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#CFE0FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#CFE0FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-moon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDFCF5" />
          <stop offset="100%" stopColor="#DCE3F2" />
        </linearGradient>
      </defs>
      <circle className="wx-glow" cx={cx} cy={cy} r={r + 11} fill={`url(#${id}-mhalo)`} />
      <g className="wx-pulse">
        <path
          d={`M ${cx + r * 0.55} ${cy - r} a ${r} ${r} 0 1 0 ${r * 0.02} ${r * 2} a ${r * 0.82} ${r * 0.82} 0 1 1 ${-r * 0.02} ${-r * 2} Z`}
          fill={`url(#${id}-moon)`}
        />
      </g>
    </g>
  );
}

type CloudTone = "light" | "grey" | "dark" | "storm";

interface CloudProps {
  id: string;
  x?: number;
  y?: number;
  scale?: number;
  tone?: CloudTone;
  className?: string;
}

function Cloud({ id, x = 50, y = 58, scale = 1, tone = "light", className = "wx-drift" }: CloudProps) {
  const tones: Record<CloudTone, [string, string]> = {
    light: ["#FDFEFF", "#D7DEEA"],
    grey:  ["#E2E7F0", "#AFB9CC"],
    dark:  ["#9AA6BC", "#6E7A93"],
    storm: ["#7E8AA3", "#515C76"],
  };
  const [c1, c2] = tones[tone];
  return (
    /*
     * Two-group pattern (critical):
     * Outer <g transform> sets position — CSS animation must NOT live here.
     * Inner <g className> carries the float/drift animation.
     * If both are on the same element, the CSS animation overrides the transform
     * and the cloud jumps to the SVG origin.
     */
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id={`${id}-cl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <g className={className}>
        <g fill={`url(#${id}-cl)`}>
          <ellipse cx="0" cy="7" rx="26" ry="12" />
          <circle cx="-15" cy="1" r="11" />
          <circle cx="0" cy="-9" r="15" />
          <circle cx="15" cy="1" r="11" />
        </g>
        <ellipse cx="0" cy="-5" rx="13" ry="5.5" fill="#FFFFFF" opacity="0.26" />
      </g>
    </g>
  );
}

interface DropsProps {
  y?: number;
  color?: string;
}

function Drops({ y = 64, color = "#4FA9F4" }: DropsProps) {
  const xs = [38, 50, 62];
  return (
    <g>
      {xs.map((x, i) => (
        <line
          key={i}
          className="wx-drop"
          x1={x}
          y1={y}
          x2={x - 2.5}
          y2={y + 7}
          stroke={color}
          strokeWidth="3.4"
          strokeLinecap="round"
          style={{ animationDelay: `${i * 0.42}s` }}
        />
      ))}
    </g>
  );
}

interface FlakesProps {
  y?: number;
}

function Flakes({ y = 64 }: FlakesProps) {
  const xs = [38, 50, 62];
  return (
    <g fill="#E6F1FF">
      {xs.map((x, i) => (
        <circle
          key={i}
          className="wx-flake"
          cx={x}
          cy={y}
          r="2.6"
          style={{ animationDelay: `${i * 0.6}s` }}
        />
      ))}
    </g>
  );
}

interface BoltProps {
  x?: number;
  y?: number;
}

function Bolt({ x = 50, y = 64 }: BoltProps) {
  return (
    <g className="wx-flash" transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id="wx-bolt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE27A" />
          <stop offset="100%" stopColor="#FBB016" />
        </linearGradient>
      </defs>
      <path
        d="M2 -8 L-6 6 H-1 L-4 16 L8 1 H2 L7 -8 Z"
        fill="url(#wx-bolt)"
        stroke="#F59E0B"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </g>
  );
}

interface FogLinesProps {
  y?: number;
}

function FogLines({ y = 64 }: FogLinesProps) {
  return (
    <g stroke="#B9C2D4" strokeWidth="3.6" strokeLinecap="round">
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          className="wx-drift"
          x1={26 + (i % 2) * 4}
          y1={y + i * 9}
          x2={70 - (i % 2) * 6}
          y2={y + i * 9}
          style={{ animationDelay: `${i * 0.5}s`, opacity: 0.8 - i * 0.12 }}
        />
      ))}
    </g>
  );
}

export type WeatherCondition =
  | "clear-day"
  | "clear-night"
  | "partly-day"
  | "partly-night"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

export function codeToKey(code: number | undefined | null, night: boolean): WeatherCondition {
  if (code == null) return "cloudy";
  if (code === 0) return night ? "clear-night" : "clear-day";
  if (code <= 2) return night ? "partly-night" : "partly-day";
  if (code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "thunder";
  return "cloudy";
}

export interface WeatherIconProps {
  code?: number;
  condition?: string;
  night?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export function WeatherIcon({ code, condition, night = false, size = 64, style = {} }: WeatherIconProps) {
  const id = useMemo(nextId, []);
  const key = (condition as WeatherCondition) ?? codeToKey(code, night);

  let body: React.ReactNode;
  switch (key) {
    case "clear-day":
      body = <Sun id={id} cx={50} cy={48} r={19} />;
      break;
    case "clear-night":
      body = <Moon id={id} cx={50} cy={48} r={17} />;
      break;
    case "partly-day":
      body = (
        <>
          <Sun id={id} cx={64} cy={36} r={13} rays={true} />
          <Cloud id={id + "a"} x={46} y={56} scale={0.94} tone="light" />
        </>
      );
      break;
    case "partly-night":
      body = (
        <>
          <Moon id={id} cx={64} cy={35} r={11} />
          <Cloud id={id + "a"} x={46} y={56} scale={0.94} tone="grey" />
        </>
      );
      break;
    case "cloudy":
      body = (
        <>
          <Cloud id={id + "b"} x={61} y={42} scale={0.66} tone="grey" className="wx-drift" />
          <Cloud id={id + "a"} x={47} y={56} scale={1} tone="light" className="wx-bob" />
        </>
      );
      break;
    case "fog":
      body = (
        <>
          <Cloud id={id + "a"} x={50} y={42} scale={0.95} tone="grey" />
          <FogLines y={61} />
        </>
      );
      break;
    case "drizzle":
      body = (
        <>
          <Cloud id={id + "a"} x={50} y={45} scale={1} tone="grey" />
          <Drops y={64} color="#7CC0F7" />
        </>
      );
      break;
    case "rain":
      body = (
        <>
          <Cloud id={id + "a"} x={50} y={45} scale={1} tone="dark" />
          <Drops y={64} color="#4FA9F4" />
        </>
      );
      break;
    case "snow":
      body = (
        <>
          <Cloud id={id + "a"} x={50} y={45} scale={1} tone="grey" />
          <Flakes y={64} />
        </>
      );
      break;
    case "thunder":
      body = (
        <>
          <Cloud id={id + "a"} x={50} y={43} scale={1} tone="storm" />
          <Bolt x={50} y={66} />
        </>
      );
      break;
    default:
      body = <Cloud id={id + "a"} x={50} y={50} scale={1.05} tone="grey" />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {body}
    </svg>
  );
}
