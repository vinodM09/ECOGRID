import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function AChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const conversationId = "user123"; // could be dynamic
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      // Call backend
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: input,
          role: "user",
        }),
      });

      const data = await res.json();

      // Add AI reply
      const aiMsg = { from: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      // Handle error (show error message in chat)
      const errorMsg = { from: "ai", text: "Sorry, something went wrong." };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Handle enter key to send message
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Navbar Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded"
      >
        Ask AI
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Box */}
          <div className="relative z-50 w-full md:w-2/5 bg-white rounded-t-xl md:rounded-xl p-4 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg">Ask AI</div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
                aria-label="Close chat"
              >
                Close
              </button>
            </div>

            {/* Messages container */}
            <div
              className="flex-1 overflow-auto p-2 space-y-2 bg-gray-50 rounded mb-3"
              style={{ minHeight: "200px" }}
            >
              {messages.length === 0 && (
                <div className="text-gray-400 text-center mt-10">
                  Start the conversation by typing a message below.
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${
                    m.from === "ai"
                      ? "bg-white text-gray-800 self-start"
                      : "bg-green-50 text-green-700 self-end"
                  }`}
                >
                  {/* {m.text} */}
                  {/* <ReactMarkdown
  className={`p-2 rounded max-w-[80%] ${
    m.from === "ai"
      ? "bg-white text-gray-800 self-start"
      : "bg-green-50 text-green-700 self-end"
  }`}
>
  {m.text}
</ReactMarkdown> */}
<div
  className={`p-2 rounded ${
    m.from === "ai"
      ? "bg-white text-gray-800 self-start"
      : "bg-green-50 text-green-700 self-end"
  }`}
>
  <ReactMarkdown>{m.text}</ReactMarkdown>
</div>

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input + Send Button */}
            <div className="flex gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about current generation, faults, battery..."
                className="flex-grow rounded px-3 py-2 border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={sendMessage}
                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
