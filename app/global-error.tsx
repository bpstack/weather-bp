"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "sans-serif",
          background: "#fff",
          color: "#111",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <p
            style={{
              fontSize: "1.125rem",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            Algo salió mal
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666",
              marginBottom: "1.5rem",
            }}
          >
            Se produjo un error crítico en la aplicación.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "9999px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
