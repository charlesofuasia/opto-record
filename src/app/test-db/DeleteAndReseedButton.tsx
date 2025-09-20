"use client";

import { useState } from "react";

export default function DeleteAndReseedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/reset-db", {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Database reset and reseeded successfully.");
      } else {
        setMessage("❌ Failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setMessage("❌ Error: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "8px 16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Resetting..." : "Delete & Reseed Database"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
