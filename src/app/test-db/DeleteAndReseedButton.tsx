"use client";

import { useState, useTransition } from "react";

export default function DeleteAndReseedButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/test-db/api/reset-db", { method: "POST" });
        const data = await res.json();
        if (data.success) setMessage("✅ Database reset & reseeded!");
        else setMessage(`❌ Error: ${data.error}`);
      } catch (err) {
        setMessage("❌ Failed to reset database.");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "Resetting..." : "Delete & Reseed Database"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

