import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, RefreshCcw, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BiMascotContext = createContext(null);

const IDLE_VIDEO = '/Bi_floating_gently_animation_202606051519.mp4';
const SPEAKING_VIDEO = '/Bi_Chemistry_Guardian_animation_202606051519.mp4';

const DEFAULT_DURATION = 7600;
const AUTO_SPEAK_INTERVAL = 60000;

const ROUTE_GUIDES = [
  {
    match: (path) => path === '/student' || path === '/student/home',
    message: 'Chào bạn, Bi ở đây nè. Đây là trang chính để mình xem nhanh hành trình học, nhiệm vụ và những hoạt động nổi bật hôm nay.'
  },
  {
    match: (path) => path.includes('/study-zone'),
    message: 'Khu học tập là nơi mình đọc bài, luyện từng phần nhỏ và ôn lại kiến thức hóa học theo nhịp của bạn.'
  },
  {
    match: (path) => path.includes('/classes'),
    message: 'Ở lớp học, bạn có thể xem lớp đã tham gia, bài giáo viên giao và tài liệu cần hoàn thành.'
  },
  {
    match: (path) => path.includes('/material/'),
    message: 'Đây là bài học chi tiết. Cứ đọc chậm, làm mini quiz ở cuối bài, sai thì mình cùng sửa từng chút.'
  },
  {
    match: (path) => path.includes('/quiz/'),
    message: 'Vào bài kiểm tra rồi. Bi sẽ nhắc bạn giữ bình tĩnh, đọc kỹ đề và kiểm tra lại trước khi nộp.'
  },
  {
    match: (path) => path.includes('/progress-map'),
    message: 'Bản đồ tiến độ giống một chuyến phiêu lưu hóa học. Chọn đảo, vượt ải câu hỏi và thu thập phần thưởng nhé.'
  },
  {
    match: (path) => path.includes('/island'),
    message: 'Đảo thú cưng là nơi chăm sóc bạn đồng hành của bạn. Mở trứng, nuôi pet và chuẩn bị sức mạnh cho các trận đấu.'
  },
  {
    match: (path) => path.includes('/pvp'),
    message: 'PVP là đấu pet thời gian thực. Trả lời đúng để tạo lợi thế, nhưng thua một lượt cũng không sao, mình còn cơ hội tiếp.'
  },
  {
    match: (path) => path.includes('/virtual-lab'),
    message: 'Phòng thí nghiệm ảo giúp bạn thử phản ứng an toàn trước khi ghi nhớ lý thuyết. Quan sát hiện tượng là chìa khóa đó.'
  },
  {
    match: (path) => path.includes('/shop'),
    message: 'Cửa hàng dùng để đổi vật phẩm hỗ trợ học tập và chiến đấu. Chọn đồ hợp chiến thuật của bạn nha.'
  },
  {
    match: (path) => path.includes('/missions'),
    message: 'Nhiệm vụ giúp bạn có mục tiêu nhỏ mỗi ngày. Hoàn thành từng bước là cách lên trình bền nhất.'
  },
  {
    match: (path) => path.includes('/leaderboard'),
    message: 'Bảng xếp hạng để mình xem tiến bộ và lấy động lực. Đua vui thôi, quan trọng là hôm nay hơn hôm qua.'
  },
  {
    match: (path) => path.includes('/profile'),
    message: 'Hồ sơ là nơi xem thông tin cá nhân, cấp độ và thành tích. Đây là nhật ký trưởng thành của bạn trên ChemLearn.'
  },
  {
    match: (path) => path.includes('/fire-quiz'),
    message: 'Boss quiz cần phản xạ nhanh và kiến thức chắc. Trả lời đúng để tấn công, sai thì bình tĩnh lấy lại nhịp.'
  }
];

const quickTips = [
  'Mẹo nhỏ: gặp câu dài thì gạch ý chính trong đầu trước, rồi mới nhìn đáp án.',
  'Nếu phân vân giữa hai đáp án, hãy tìm dữ kiện hóa học chắc nhất trong đề để loại trừ.',
  'Học tốt không phải là không sai. Học tốt là biết sửa sai nhanh hơn lần trước.',
  'Bạn có thể ghé đảo thú cưng sau khi học xong để đổi không khí một chút.',
  'PVP vui nhất khi mình vừa chơi vừa nhớ lại kiến thức. Đừng ngại thử nhé.'
];

const pickRouteMessage = (pathname) => {
  const guide = ROUTE_GUIDES.find((item) => item.match(pathname));
  return guide?.message || 'Bi đang đi cùng bạn trong màn này. Cần gợi ý thì bấm vào Bi nhé.';
};

export const BiMascotProvider = ({ children }) => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [, setTipIndex] = useState(0);
  const timeoutRef = useRef(null);
  const lastRouteRef = useRef('');

  const stopSpeaking = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((nextMessage, options = {}) => {
    if (!nextMessage) return;

    window.clearTimeout(timeoutRef.current);
    setMessage(nextMessage);
    setIsOpen(true);
    setIsSpeaking(true);

    const duration = options.duration ?? Math.max(DEFAULT_DURATION, nextMessage.length * 85);
    timeoutRef.current = window.setTimeout(() => {
      setIsSpeaking(false);
    }, duration);
  }, []);

  const sayRouteGuide = useCallback(() => {
    speak(pickRouteMessage(location.pathname), { duration: 8200 });
  }, [location.pathname, speak]);

  const sayQuickTip = useCallback(() => {
    setTipIndex((current) => {
      speak(quickTips[current % quickTips.length], { duration: 7600 });
      return current + 1;
    });
  }, [speak]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    if (lastRouteRef.current === location.pathname) return;
    lastRouteRef.current = location.pathname;
    const timer = window.setTimeout(() => {
      speak(pickRouteMessage(location.pathname), { duration: 8200 });
    }, 550);

    return () => window.clearTimeout(timer);
  }, [location.pathname, speak]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((current) => {
        speak(quickTips[current % quickTips.length], { duration: 7600 });
        return current + 1;
      });
    }, AUTO_SPEAK_INTERVAL);

    return () => window.clearInterval(interval);
  }, [speak]);

  const value = useMemo(() => ({
    speak,
    stopSpeaking,
    sayRouteGuide
  }), [sayRouteGuide, speak, stopSpeaking]);

  return (
    <BiMascotContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-3 z-[70] sm:bottom-5 sm:right-5">
        <div className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2">
          <AnimatePresence>
            {isOpen && message && (
              <motion.div
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <div className="mb-2 flex flex-col gap-1.5 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={sayRouteGuide}
                className="rounded-full p-2 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
                aria-label="Nghe Bi giới thiệu màn hiện tại"
                title="Bi giới thiệu màn này"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={sayQuickTip}
                className="rounded-full p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-700"
                aria-label="Nghe mẹo học tập từ Bi"
                title="Mẹo học tập"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={sayQuickTip}
              className="group relative h-28 w-28 overflow-hidden rounded-full border-2 border-cyan-200 bg-cyan-50 shadow-2xl shadow-cyan-950/20 ring-4 ring-white/80 transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 sm:h-36 sm:w-36"
              aria-label="Gọi Bi trợ giúp"
            >
              <video
                key={isSpeaking ? 'speaking' : 'idle'}
                className="h-full w-full scale-125 object-cover"
                src={isSpeaking ? SPEAKING_VIDEO : IDLE_VIDEO}
                autoPlay
                loop
                muted
                playsInline
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 to-transparent px-2 pb-2 pt-8 text-center text-xs font-black text-white opacity-95">
                {isSpeaking ? 'Bi đang nói' : 'Gọi Bi'}
              </span>
              <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            </button>
          </div>
        </div>
      </div>
    </BiMascotContext.Provider>
  );
};

export const useBiMascot = () => {
  const context = useContext(BiMascotContext);
  return context || {
    speak: () => {},
    stopSpeaking: () => {},
    sayRouteGuide: () => {}
  };
};
