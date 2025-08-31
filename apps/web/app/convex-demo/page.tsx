"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api.js";
import { useState } from "react";

export default function ConvexDemo() {
  const messages = useQuery(api.functions.messages.list) ?? [];

  const send = useMutation(api.functions.messages.send);

  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  return (
    <div style={{ padding: 16 }}>
      <h1>Convex Demo</h1>
      <ul>
        {messages.map((m: any) => (
          <li key={m._id as any}>
            <strong>{m.author}:</strong> {m.body}
          </li>
        ))}
      </ul>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await send({ body, author });
          setBody("");
        }}
      >
        <input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <input
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

