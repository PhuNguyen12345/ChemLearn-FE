import React from 'react';
import { Bot, User } from 'lucide-react';

const SUBSCRIPT_DIGITS = {
  '\u2080': '0',
  '\u2081': '1',
  '\u2082': '2',
  '\u2083': '3',
  '\u2084': '4',
  '\u2085': '5',
  '\u2086': '6',
  '\u2087': '7',
  '\u2088': '8',
  '\u2089': '9',
};

const normalizeChemText = (value = '') => value
  .replace(/[\u2080-\u2089]/g, (digit) => SUBSCRIPT_DIGITS[digit] || digit)
  .replace(/\u00e2\u201a\u20ac/g, '0')
  .replace(/\u00e2\u201a\u201a/g, '2')
  .replace(/\u00e2\u2020\u2019/g, '->')
  .replace(/\u00e2\u20ac\u00a2/g, '-')
  .replace(/\u2022/g, '-')
  .replace(/\u2192/g, '->');

const cleanInlineText = (value = '') => normalizeChemText(value)
  .replace(/<sub\b[^>]*>(.*?)<\/sub>/gi, '_$1')
  .replace(/<sup\b[^>]*>(.*?)<\/sup>/gi, '^$1')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/?[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
  .replace(/\\text\{([^{}]+)\}/g, '$1')
  .replace(/\\left|\\right/g, '')
  .replace(/\\times/g, ' x ')
  .replace(/\\cdot/g, ' . ')
  .replace(/\\_/g, '_')
  .replace(/\\([a-zA-Z]+)/g, '$1')
  .replace(/\$/g, '')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/__([^_]+)__/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\s+([,.!?;:])/g, '$1')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const formatAssistantText = (content = '') => normalizeChemText(content.normalize('NFC'))
  .replace(/\r\n/g, '\n')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/^\s{0,3}#{1,6}\s+/gm, '')
  .replace(/^\s{0,3}[-*]\s+/gm, '- ')
  .split('\n')
  .map(cleanInlineText)
  .filter(Boolean);

const MessageBubble = ({ message }) => {
  const isAssistant = message.role === 'assistant' || message.role === 'ASSISTANT';
  const lines = isAssistant ? formatAssistantText(message.content) : [message.content];

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
        {isAssistant ? (
          <div className="space-y-2">
            {lines.map((line, index) => (
              <p key={`${line}-${index}`} className="whitespace-pre-wrap break-words">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
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
