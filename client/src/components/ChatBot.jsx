import { useState } from "react";

export default function Chatbot() {
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
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}