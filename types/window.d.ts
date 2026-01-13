/// <reference types="react" />

export {};

declare global {
  interface Window {
    MSStream?: unknown;
  }

  interface Navigator {
    standalone?: boolean;
  }
}
