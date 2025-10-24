import React, { useState } from "react";

export default function AIInput({ onSend }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const conversationId = "user123"; // can be dynamic per user

  const sendMessage = async () => {
    if (!input.trim()) return;

    // add user msg to chat
    setMessages([...messages, { role: "user", content: input }]);

    // call FastAPI backend
    const res = await fetch("http://localhost:8000/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: input,
        role: "user"
      })
    });

    const data = await res.json();

    // add bot reply
    setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    setInput("");
  };

  return (
    <form className="mt-3 flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
      {/* Messages Container */}
      <div className="messages mb-3 max-h-60 overflow-auto p-2 bg-white shadow-sm rounded">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 text-sm ${msg.role === "user" ? "text-blue-700" : "text-gray-800"}`}
          >
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Input + Button in one row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about current generation, faults, battery..."
          className="flex-grow rounded px-3 py-2 border border-gray-300"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
    </form>
  );
}
