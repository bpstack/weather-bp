"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function ErrorMonitor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("[GlobalError]", event.error ?? event.message);
      try {
        track("unhandled_error", {
          message: event.message.slice(0, 200),
          filename: event.filename,
          lineno: String(event.lineno),
        });
      } catch {
        // noop
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      console.error("[UnhandledRejection]", event.reason);
      try {
        track("unhandled_rejection", { reason: reason.slice(0, 200) });
      } catch {
        // noop
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
