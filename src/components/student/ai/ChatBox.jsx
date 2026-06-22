import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImageUp, LoaderCircle, Plus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  aiChat,
  aiChatImage,
  getAiSessionMessages,
  getAiSessions,
} from '@/lib/api';
import MessageBubble from './MessageBubble';
import SuggestedLabCard from './SuggestedLabCard';

const makeLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const BI_AVATAR = '/bi-companion.png';

const toUiMessage = (message) => ({
  id: message.id || makeLocalId(),
  role: message.role === 'ASSISTANT' ? 'assistant' : 'user',
  content: message.content,
});

const ChatBox = ({ studentId, context }) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [suggestedLabs, setSuggestedLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const imageInputRef = useRef(null);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === sessionId),
    [sessions, sessionId]
  );

  const loadSessions = async () => {
    if (!studentId) return;
    try {
      const data = await getAiSessions(studentId);
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [studentId]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!sessionId) return;
      try {
        setLoadingHistory(true);
        const data = await getAiSessionMessages(sessionId);
        setMessages((Array.isArray(data) ? data : []).map(toUiMessage));
        if (selectedSession?.topic) {
          setCurrentTopic(selectedSession.topic);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Không tải được lịch sử chat.');
      } finally {
        setLoadingHistory(false);
      }
    };

    loadMessages();
  }, [sessionId, selectedSession?.topic]);

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setCurrentTopic('');
    setSuggestedLabs([]);
    clearSelectedImage();
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl('');
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      toast.error('Vui lòng chọn một file ảnh.');
      event.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Ảnh cần nhỏ hơn hoặc bằng 8MB.');
      event.target.value = '';
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && !selectedImage) || loading) return;
    if (!studentId) {
      toast.error('Không tìm thấy thông tin học sinh.');
      return;
    }

    const imageToSend = selectedImage;
    const userMessage = {
      id: makeLocalId(),
      role: 'user',
      content: `${trimmedMessage || 'Nhờ Bi đọc ảnh đề bài.'}${imageToSend ? '\n[Đã gửi ảnh đề bài]' : ''}`,
    };
    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const data = imageToSend
        ? await aiChatImage({
            studentId,
            sessionId,
            grade: Number(context.grade),
            bookType: context.bookType,
            message: trimmedMessage,
            image: imageToSend,
          })
        : await aiChat({
            studentId,
            sessionId,
            grade: Number(context.grade),
            bookType: context.bookType,
            message: trimmedMessage,
          });

      setSessionId(data.sessionId || sessionId);
      setCurrentTopic(data.topic || currentTopic);
      setSuggestedLabs(Array.isArray(data.suggestedLabs) ? data.suggestedLabs : []);
      if (imageToSend) {
        clearSelectedImage();
      }
      setMessages((current) => [
        ...current,
        {
          id: makeLocalId(),
          role: 'assistant',
          content: data.answer || 'Bi chưa có câu trả lời.',
        },
      ]);
      loadSessions();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không gửi được câu hỏi.');
      setMessages((current) => current.filter((item) => item.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[620px] grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={handleNewSession}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Cuộc trò chuyện mới
        </button>

        <div className="mt-4 space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => {
                setSessionId(session.id);
                setCurrentTopic(session.topic || '');
              }}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-bold transition ${
                session.id === sessionId
                  ? 'border-teal-300 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span className="block truncate">{session.topic || 'Chủ đề chung'}</span>
              <span className="mt-0.5 block text-xs font-semibold text-slate-400">
                Lớp {session.grade} · {session.bookType}
              </span>
            </button>
          ))}

          {sessions.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-semibold text-slate-400">
              Chưa có cuộc trò chuyện
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-[620px] flex-col rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-violet-100 bg-white p-0.5 shadow-sm">
              <img
                src={BI_AVATAR}
                alt="Bi"
                className="h-full w-full object-contain"
              />
              <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Bi đang trò chuyện với bạn</h2>
              <p className="text-xs font-bold text-slate-400">
                {selectedSession?.topic || currentTopic || 'Cùng gỡ từng câu hỏi Hóa học'}
              </p>
            </div>
          </div>
          {loadingHistory && <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-violet-100 bg-white px-6 py-5 text-center shadow-sm">
                <img
                  src={BI_AVATAR}
                  alt="Bi"
                  className="mb-3 h-20 w-20 object-contain"
                />
                <p className="text-sm font-black text-slate-700">Bi đang ở đây, nhắn một câu hỏi Hóa học để mình cùng gỡ nhé.</p>
              </div>
            </div>
          )}

          {messages.map((item) => (
            <MessageBubble key={item.id} message={item} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Bi đang suy nghĩ...
            </div>
          )}
        </div>

        {suggestedLabs.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {suggestedLabs.slice(0, 2).map((lab) => (
                <SuggestedLabCard key={lab.id || lab.title} lab={lab} />
              ))}
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-2">
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Ảnh đề bài đã chọn"
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-indigo-800">{selectedImage.name}</p>
                <p className="text-xs font-semibold text-indigo-500">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelectedImage}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 transition hover:text-rose-600"
                title="Bỏ ảnh"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 bg-white p-4">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Chụp hoặc chọn ảnh đề bài"
          >
            <ImageUp className="h-5 w-5" />
          </button>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Nhắn cho Bi về bài Hóa của bạn..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
          />
          <button
            type="submit"
            disabled={loading || (!message.trim() && !selectedImage)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Gửi
          </button>
        </form>
      </section>
    </div>
  );
};

export default ChatBox;
