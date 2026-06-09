import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isAssistant = message.role === 'assistant' || message.role === 'ASSISTANT';

  return (
    <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-lg px-4 py-3 text-sm font-semibold leading-6 shadow-sm ${
          isAssistant
            ? 'border border-teal-100 bg-white text-slate-700'
            : 'bg-indigo-600 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>

      {!isAssistant && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
