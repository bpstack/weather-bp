import { spawnSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// La revisión versiona la página precacheada: sin ella, un despliegue nuevo
// seguiría sirviendo la copia antigua de `/~offline`.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() || crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // `/~offline` no la descubre Serwist sola: no se enlaza desde ninguna parte.
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

const nextConfig: NextConfig = {
  turbopack: {}, // Empty config to allow webpack usage with Serwist
};

export default withSerwist(nextConfig);
