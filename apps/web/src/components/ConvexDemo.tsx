import { useState } from "react";
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

function ConvexDemoInner() {
  const [newMessage, setNewMessage] = useState("");
  const messages = useQuery(api.functions.messages.list);
  const sendMessage = useMutation(api.functions.messages.send);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Provide a default author to satisfy backend validation
      sendMessage({ body: newMessage.trim(), author: "anonymous" });
      setNewMessage("");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Convex Demo</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Messages</h2>
        <div className="space-y-2">
          {messages?.map((message) => (
            <div key={message._id} className="p-3 bg-gray-100 rounded">
              <p>{message.body}</p>
              <small className="text-gray-500">
                {new Date(message._creationTime).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function ConvexDemo() {
  const convexUrl = import.meta.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Convex Demo</h1>
        <p className="text-red-500">
          Missing NEXT_PUBLIC_CONVEX_URL environment variable. 
          Please set it in your .env.local file.
        </p>
      </div>
    );
  }

  const convex = new ConvexReactClient(convexUrl);

  return (
    <ConvexProvider client={convex}>
      <ConvexDemoInner />
    </ConvexProvider>
  );
}