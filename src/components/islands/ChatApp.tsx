import { useMutation, useQuery } from "convex/react";
import { api as generatedApi } from "@/../convex/_generated/api";
import BaseIsland from "./BaseIsland";
import type { Result } from "neverthrow";
import { ResultAsync } from "neverthrow";
import { useState, type FormEvent } from "react";

const api: any = generatedApi as any;

type Message = {
  _id: string;
  userId: string;
  content: string;
  createdAt: number;
  displayName?: string;
};

export default function ChatApp() {
  const list = useQuery(api.messages?.list, {} as any) as Message[] | undefined;
  const send = useMutation(api.messages?.send as any) as (args: {
    content: string;
  }) => Promise<string>;

  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) return;

    setPending(true);

    const result: Result<string, Error> = await ResultAsync.fromPromise(
      send({ content: trimmed }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );

    setPending(false);

    if (result.isErr()) {
      setError(result.error.message);
      return;
    }

    setContent("");
  };

  return (
    <BaseIsland title="Chat App">
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Say something…"
          style={{
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        />
        <button disabled={pending || !content.trim()} type="submit">
          {pending ? "Sending…" : "Send"}
        </button>
      </form>

      {error ? (
        <p style={{ color: "#b91c1c", marginTop: 8 }}>Error: {error}</p>
      ) : null}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          marginTop: 12,
          display: "grid",
          gap: 8,
        }}
      >
        {list === undefined ? (
          <li>Loading messages…</li>
        ) : list.length === 0 ? (
          <li>No messages yet. Say hello!</li>
        ) : (
          list.map((m) => (
            <li
              key={m._id}
              style={{ padding: 8, border: "1px solid #eee", borderRadius: 6 }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {m.displayName || m.userId} —{" "}
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div>{m.content}</div>
            </li>
          ))
        )}
      </ul>
    </BaseIsland>
  );
}
