import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion as motionFactory } from "framer-motion";
import {
  Bell,
  LoaderCircle,
  MessageCircle,
  RefreshCcw,
  Send,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { createFeedbackReport, getBiCompanionMessages } from "@/lib/api";

const BiMascotContext = createContext(null);

const MotionDiv = motionFactory.div;
const MotionImg = motionFactory.img;

const BI_AVATAR = "/bi-companion.png";
const DEFAULT_DURATION = 7600;

const ROUTE_GUIDES = [
  {
    match: (path) => path === "/student" || path === "/student/home",
    message:
      "Chào bạn, Bi ở đây nè. Đây là trang chính để mình xem nhanh hành trình học, nhiệm vụ và những hoạt động nổi bật hôm nay.",
  },
  {
    match: (path) => path.includes("/study-zone"),
    message:
      "Khu học tập là nơi mình đọc bài, luyện từng phần nhỏ và ôn lại kiến thức hóa học theo nhịp của bạn.",
  },
  {
    match: (path) => path.includes("/material/"),
    message:
      "Đây là bài học chi tiết. Cứ đọc chậm, làm mini quiz ở cuối bài, sai thì mình cùng sửa từng chút.",
  },
  {
    match: (path) => path.includes("/quiz/"),
    message:
      "Vào bài kiểm tra rồi. Bi nhắc bạn giữ bình tĩnh, đọc kỹ đề và kiểm tra lại trước khi nộp.",
  },
  {
    match: (path) => path.includes("/progress-map"),
    message:
      "Bản đồ tiến độ giống một chuyến phiêu lưu hóa học. Chọn đảo, vượt ải câu hỏi và thu thập phần thưởng nhé.",
  },
  {
    match: (path) => path.includes("/island"),
    message:
      "Đảo thú cưng là nơi chăm sóc bạn đồng hành của bạn. Mở trứng, nuôi pet và chuẩn bị sức mạnh cho các trận đấu.",
  },
  {
    match: (path) => path.includes("/pvp"),
    message:
      "PVP vui nhất khi mình vừa chơi vừa nhớ lại kiến thức. Đúng một câu là thêm lợi thế, sai một lượt thì bình tĩnh lấy lại nhịp.",
  },
  {
    match: (path) => path.includes("/virtual-lab"),
    message:
      "Phòng thí nghiệm ảo giúp bạn thử phản ứng an toàn trước khi ghi nhớ lý thuyết. Quan sát hiện tượng là chìa khóa đó.",
  },
  {
    match: (path) => path.includes("/shop"),
    message:
      "Cửa hàng dùng để đổi vật phẩm hỗ trợ học tập và chiến đấu. Chọn đồ hợp chiến thuật của bạn nha.",
  },
  {
    match: (path) => path.includes("/leaderboard"),
    message:
      "Bảng xếp hạng để mình xem tiến bộ và lấy động lực. Đua vui thôi, quan trọng là hôm nay hơn hôm qua.",
  },
  {
    match: (path) => path.includes("/profile"),
    message:
      "Hồ sơ là nơi xem thông tin cá nhân, cấp độ và thành tích. Đây là nhật ký trưởng thành của bạn trên ChemLearn.",
  },
  {
    match: (path) => path.includes("/fire-quiz"),
    message:
      "Boss quiz cần phản xạ nhanh và kiến thức chắc. Trả lời đúng để tấn công, sai thì bình tĩnh lấy lại nhịp.",
  },
];

const quickTips = [
  "Mẹo nhỏ: gặp câu dài thì gạch ý chính trong đầu trước, rồi mới nhìn đáp án.",
  "Nếu phân vân giữa hai đáp án, hãy tìm dữ kiện hóa học chắc nhất trong đề để loại trừ.",
  "Học tốt không phải là không sai. Học tốt là biết sửa sai nhanh hơn lần trước.",
  "Bạn có thể ghé đảo thú cưng sau khi học xong để đổi không khí một chút.",
  "Bi nhắc nhẹ: hôm nay xem nhiệm vụ hằng ngày trước, làm xong rồi hãy vào PVP hoặc cửa hàng nha.",
];

const SUPPORT_GREETING =
  "Chào bạn, Bi là bạn đồng hành hỗ trợ trên ChemLearn. Bạn có thể nhắn lỗi, góp ý, hoặc nhờ Bi nhắc việc cần làm trong ngày.";

const REMINDERS = [
  {
    key: "morning",
    label: "7:00 sáng",
    message:
      "7:00 sáng, Bi sẽ gửi email và tin nhắn admin để nhắc bạn xem nhiệm vụ hằng ngày, giữ streak và chọn một bài ngắn để khởi động nhé.",
  },
  {
    key: "evening",
    label: "8:00 tối",
    message:
      "8:00 tối, Bi sẽ gửi email và tin nhắn admin để động viên bạn ôn lại phần đã học, nhận thưởng nhiệm vụ và chuẩn bị cho ngày mai.",
  },
];

const makeLocalId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toCompanionSupportMessage = (item) => ({
  id: `companion-${item.id}`,
  role: "assistant",
  content: `${item.senderName || "Admin ChemLearn"} - ${item.title}\n${item.message}`,
});

const pickRouteMessage = (pathname) => {
  const guide = ROUTE_GUIDES.find((item) => item.match(pathname));
  return (
    guide?.message ||
    "Bi đang đi cùng bạn trong màn này. Cần gợi ý thì bấm nút đổi lời nhắc hoặc mở chat hỗ trợ nhé."
  );
};

export const BiMascotProvider = ({ children }) => {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem("chemlearn_bi_enabled") !== "false",
  );
  const textIndexRef = useRef(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportInput, setSupportInput] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportMessagesLoading, setSupportMessagesLoading] = useState(false);
  const [supportMessages, setSupportMessages] = useState([]);
  const timeoutRef = useRef(null);
  const lastRouteRef = useRef("");

  const messageDeck = useMemo(
    () => [
      pickRouteMessage(location.pathname),
      ...quickTips,
      ...REMINDERS.map((reminder) => reminder.message),
    ],
    [location.pathname],
  );

  const stopSpeaking = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setIsSpeaking(false);
  }, []);

  const appendBiSupportMessage = useCallback((content) => {
    setSupportMessages((current) => [
      ...current,
      {
        id: makeLocalId(),
        role: "assistant",
        content,
      },
    ]);
  }, []);

  const loadCompanionMessages = useCallback(async () => {
    try {
      setSupportMessagesLoading(true);
      const messages = await getBiCompanionMessages();
      const companionMessages = messages.map(toCompanionSupportMessage);

      setSupportMessages((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const nextMessages = companionMessages.filter(
          (item) => !existingIds.has(item.id),
        );
        return nextMessages.length > 0 ? [...current, ...nextMessages] : current;
      });
    } catch (error) {
      console.debug("Could not load Bi companion messages", error);
    } finally {
      setSupportMessagesLoading(false);
    }
  }, []);

  const speak = useCallback(
    (nextMessage, options = {}) => {
      if (!nextMessage || !isEnabled) return;

      window.clearTimeout(timeoutRef.current);
      setMessage(nextMessage);
      setIsOpen(true);
      setSupportOpen(false);
      setIsSpeaking(true);

      const duration =
        options.duration ?? Math.max(DEFAULT_DURATION, nextMessage.length * 85);
      timeoutRef.current = window.setTimeout(() => {
        setIsSpeaking(false);
      }, duration);
    },
    [isEnabled],
  );

  const cycleBiText = useCallback(() => {
    textIndexRef.current += 1;
    speak(messageDeck[textIndexRef.current % messageDeck.length], {
      duration: 8200,
    });
  }, [messageDeck, speak]);

  const openSupportChat = useCallback(() => {
    setSupportOpen(true);
    setIsOpen(false);
    setSupportMessages((current) =>
      current.length > 0
        ? current
        : [{ id: "welcome", role: "assistant", content: SUPPORT_GREETING }],
    );
    void loadCompanionMessages();
  }, [loadCompanionMessages]);

  const handleSupportSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = supportInput.trim();
    if (!trimmedMessage || supportSubmitting) return;

    const userMessage = {
      id: makeLocalId(),
      role: "user",
      content: trimmedMessage,
    };

    setSupportMessages((current) => [...current, userMessage]);
    setSupportInput("");

    try {
      setSupportSubmitting(true);
      await createFeedbackReport({
        type: "feedback",
        priority: "medium",
        title: "Tin nhắn hỗ trợ từ Bi đồng hành",
        message: trimmedMessage,
      });
      appendBiSupportMessage(
        "Bi đã gửi tin nhắn của bạn cho admin rồi. Trong lúc chờ phản hồi, bạn cứ tiếp tục học, Bi vẫn ở đây để nhắc việc cho bạn.",
      );
      toast.success("Đã gửi tin nhắn hỗ trợ cho admin.");
    } catch (error) {
      appendBiSupportMessage(
        error?.response?.data?.message ||
          "Bi chưa gửi được tin nhắn lúc này. Bạn thử lại sau một chút nha.",
      );
      toast.error(
        error?.response?.data?.message || "Không gửi được tin nhắn hỗ trợ.",
      );
    } finally {
      setSupportSubmitting(false);
    }
  };

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    localStorage.setItem("chemlearn_bi_enabled", String(isEnabled));
    if (!isEnabled) {
      window.clearTimeout(timeoutRef.current);
      setIsSpeaking(false);
      setIsOpen(false);
      setSupportOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return undefined;
    if (lastRouteRef.current === location.pathname) return;
    lastRouteRef.current = location.pathname;
    const timer = window.setTimeout(() => {
      speak(pickRouteMessage(location.pathname), { duration: 8200 });
      textIndexRef.current = 0;
    }, 550);

    return () => window.clearTimeout(timer);
  }, [isEnabled, location.pathname, speak]);

  useEffect(() => {
    if (!isEnabled || !supportOpen) return undefined;

    void loadCompanionMessages();
    const intervalId = window.setInterval(loadCompanionMessages, 60000);
    return () => window.clearInterval(intervalId);
  }, [isEnabled, loadCompanionMessages, supportOpen]);

  const toggleBi = useCallback(() => {
    setIsEnabled((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      speak,
      stopSpeaking,
      sayRouteGuide: cycleBiText,
      isEnabled,
      setIsEnabled,
      toggleBi,
    }),
    [cycleBiText, isEnabled, speak, stopSpeaking, toggleBi],
  );

  return (
    <BiMascotContext.Provider value={value}>
      {children}

      {isEnabled && (
        <div className="pointer-events-none fixed bottom-4 right-3 z-[70] sm:bottom-5 sm:right-5">
          <div className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2">
            <AnimatePresence>
              {isOpen && message && !supportOpen && (
                <MotionDiv
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="relative mr-2 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-cyan-200/80 bg-white/95 p-4 pr-10 text-sm font-semibold leading-6 text-slate-700 shadow-2xl shadow-cyan-950/15 backdrop-blur"
                >
                  <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-cyan-700">
                    <MessageCircle className="h-4 w-4" />
                    Bi đồng hành
                  </div>
                  <p>{message}</p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-2 top-2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Ẩn lời nhắn của Bi"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute -bottom-2 right-10 h-4 w-4 rotate-45 border-b border-r border-cyan-200/80 bg-white/95" />
                </MotionDiv>
              )}

              {supportOpen && (
                <MotionDiv
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.22 }}
                  className="relative mr-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-2xl shadow-cyan-950/15"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-cyan-100 bg-cyan-50 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-cyan-700">
                        <MessageCircle className="h-4 w-4" />
                        Chat hỗ trợ cùng Bi
                      </div>
                      <p className="mt-1 text-xs font-semibold text-cyan-700/75">
                        Email và tin nhắn admin lúc 7:00 sáng, 8:00 tối vẫn
                        được gửi dù bạn không mở ChemLearn.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSupportOpen(false)}
                      className="rounded-full p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600"
                      aria-label="Đóng chat hỗ trợ của Bi"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
                    <div className="grid grid-cols-2 gap-2">
                      {REMINDERS.map((reminder) => (
                        <div
                          key={reminder.key}
                          className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          <div className="flex items-center gap-1.5 text-cyan-700">
                            <Bell className="h-3.5 w-3.5" />
                            {reminder.label}
                          </div>
                          <p className="mt-1 line-clamp-2 text-slate-500">
                            {reminder.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    {supportMessagesLoading && (
                      <div className="flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700">
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        Đang tải tin nhắn từ admin...
                      </div>
                    )}

                    {supportMessages.map((item) => (
                      <div
                        key={item.id}
                        className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm font-semibold leading-5 ${
                            item.role === "user"
                              ? "rounded-tr-md bg-indigo-600 text-white"
                              : "rounded-tl-md border border-cyan-100 bg-cyan-50 text-slate-700"
                          }`}
                        >
                          {item.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSupportSubmit}
                    className="flex items-end gap-2 border-t border-slate-100 bg-white p-3"
                  >
                    <textarea
                      value={supportInput}
                      onChange={(event) => setSupportInput(event.target.value)}
                      placeholder="Nhắn lỗi, góp ý hoặc việc bạn muốn Bi nhắc..."
                      rows={1}
                      className="min-h-10 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={supportSubmitting || !supportInput.trim()}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md shadow-cyan-300/40 transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Gửi tin nhắn hỗ trợ"
                    >
                      {supportSubmitting ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <div className="absolute -bottom-2 right-10 h-4 w-4 rotate-45 border-b border-r border-cyan-200 bg-white" />
                </MotionDiv>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2">
              <div className="mb-2 flex flex-col gap-1.5 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-lg backdrop-blur">
                <button
                  type="button"
                  onClick={cycleBiText}
                  className="rounded-full p-2 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                  aria-label="Đổi lời nhắc của Bi"
                  title="Đổi lời nhắc"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={openSupportChat}
                  className="rounded-full p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-700"
                  aria-label="Mở chat hỗ trợ cùng Bi"
                  title="Chat hỗ trợ"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={cycleBiText}
                className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-cyan-200 bg-cyan-50 shadow-2xl shadow-cyan-950/20 ring-4 ring-white/80 transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 sm:h-36 sm:w-36"
                aria-label="Gọi Bi trợ giúp"
              >
                <MotionImg
                  src={BI_AVATAR}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-contain p-1"
                  animate={
                    isSpeaking
                      ? { scale: [1, 1.05, 1], y: [0, -3, 0] }
                      : { y: [0, -5, 0] }
                  }
                  transition={{
                    duration: isSpeaking ? 1.35 : 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 to-transparent px-2 pb-2 pt-8 text-center text-xs font-black text-white opacity-95">
                  {supportOpen ? "Chat với Bi" : "Gọi Bi"}
                </span>
                <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </BiMascotContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBiMascot = () => {
  const context = useContext(BiMascotContext);
  return (
    context || {
      speak: () => {},
      stopSpeaking: () => {},
      sayRouteGuide: () => {},
      isEnabled: true,
      setIsEnabled: () => {},
      toggleBi: () => {},
    }
  );
};
