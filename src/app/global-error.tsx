"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f7f3eb", color: "#17211c" }}>
        <main style={{ maxWidth: 420, margin: "20vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ marginBottom: 24 }}>Please try again, or open the login page.</p>
          <p style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: 48,
                padding: "0 20px",
                borderRadius: 16,
                border: 0,
                background: "#0c3d2e",
                color: "#f7f3eb",
                fontWeight: 700,
              }}
            >
              Try again
            </button>
            <a
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 48,
                padding: "0 20px",
                borderRadius: 16,
                background: "#e8d5b5",
                color: "#3d2e16",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Login
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
