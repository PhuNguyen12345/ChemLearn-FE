import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { LoaderCircle, User, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import 'katex/dist/katex.min.css';
import { aiTextToSpeech } from '@/lib/api';

const BI_AVATAR = '/bi-companion.png';

const normalizeAssistantContent = (value = '') => value
  .normalize('NFC')
  .replace(/\r\n/g, '\n')
  .replace(/<sub\b[^>]*>(.*?)<\/sub>/gi, '_{$1}')
  .replace(/<sup\b[^>]*>(.*?)<\/sup>/gi, '^{$1}')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/?[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\\\[/g, '$$')
  .replace(/\\\]/g, '$$')
  .replace(/\\\(/g, '$')
  .replace(/\\\)/g, '$')
  .trim();

const toSpeechFriendlyText = (value = '') => normalizeAssistantContent(value)
  .replace(/\$\$?/g, ' ')
  .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 trên $2')
  .replace(/\\rightarrow|\\to|→/g, ' tạo thành ')
  .replace(/\\times/g, ' nhân ')
  .replace(/\\cdot/g, ' nhân ')
  .replace(/\\text\{([^{}]+)\}/g, '$1')
  .replace(/\\left|\\right/g, '')
  .replace(/[_^]\{([^{}]+)\}/g, ' $1')
  .replace(/[_^]([A-Za-z0-9]+)/g, ' $1')
  .replace(/[*_`>#-]/g, ' ')
  .replace(/\s+([,.!?;:])/g, '$1')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const markdownComponents = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-black text-slate-900">{children}</strong>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1.5 last:mb-0">{children}</ol>,
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1.5 last:mb-0">{children}</ul>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  h1: ({ children }) => <h3 className="mb-3 text-base font-black text-slate-950">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-3 text-base font-black text-slate-950">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-2 text-sm font-black text-slate-900">{children}</h4>,
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.92em] font-bold text-slate-800">
      {children}
    </code>
  ),
};

const MessageBubble = ({ message }) => {
  const isAssistant = message.role === 'assistant' || message.role === 'ASSISTANT';
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');

  const assistantContent = useMemo(
    () => normalizeAssistantContent(message.content || ''),
    [message.content]
  );

  const speechText = useMemo(() => {
    if (!isAssistant) return '';
    return toSpeechFriendlyText(message.speechText || message.content || '');
  }, [isAssistant, message.content, message.speechText]);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
  }, []);

  const playAudioUrl = async (audioUrl) => {
    const audio = audioRef.current || new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.onended = () => setSpeaking(false);
    audio.onerror = () => {
      setSpeaking(false);
      toast.error('Chưa phát được giọng đọc. Thử lại giúp mình nhé.');
    };

    setSpeaking(true);
    await audio.play();
  };

  const handleSpeak = async () => {
    if (!speechText || voiceLoading) return;

    if (speaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSpeaking(false);
      return;
    }

    try {
      if (!audioUrlRef.current) {
        setVoiceLoading(true);
        const audioBlob = await aiTextToSpeech(speechText);
        audioUrlRef.current = URL.createObjectURL(audioBlob);
      }
      await playAudioUrl(audioUrlRef.current);
    } catch (error) {
      console.error(error);
      setSpeaking(false);
      toast.error(error?.response?.data?.message || 'Không tạo được giọng đọc AI.');
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white p-0.5 shadow-sm">
          <img
            src={BI_AVATAR}
            alt="Bi"
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-5 py-4 text-sm font-semibold leading-7 shadow-sm ${
          isAssistant
            ? 'rounded-tl-md border border-violet-100 bg-white text-slate-700'
            : 'rounded-tr-md bg-indigo-600 text-white'
        }`}
      >
        {isAssistant ? (
          <div>
            <div className="ai-tutor-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                components={markdownComponents}
              >
                {assistantContent}
              </ReactMarkdown>
            </div>

            {speechText && (
              <button
                type="button"
                onClick={handleSpeak}
                disabled={voiceLoading}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 transition hover:border-teal-200 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                title="Phát lại lời giải thích bằng giọng AI"
              >
                {voiceLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {voiceLoading ? 'Đang tạo giọng...' : speaking ? 'Dừng đọc' : 'Nghe giải thích'}
              </button>
            )}
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
