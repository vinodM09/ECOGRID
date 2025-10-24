import React from 'react'
import AIInput from './AIInput'

export default function AIChat({ isOpen, messages, onClose, onSend }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-50 w-full md:w-2/5 bg-white rounded-t-xl md:rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Ask AI</div>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="h-64 overflow-auto p-2 space-y-2 bg-gray-50 rounded">
          {messages.map((m,i)=>(
            <div key={i} className={`p-2 rounded ${m.from==='ai'?'bg-white text-gray-800':'bg-green-50 text-green-700 self-end'}`}>{m.text}</div>
          ))}
        </div>
        <AIInput onSend={onSend} />
      </div>
    </div>
  )
}