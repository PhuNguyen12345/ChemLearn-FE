import { useState, useEffect } from 'react';

export function useLabTimer(durationMinutes, onTimeUp, isActive) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    // Nếu thời gian thay đổi từ store, cập nhật lại (VD: lúc fetch xong)
    setTimeRemaining(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const intervalId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, timeRemaining, onTimeUp]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isTimeUp: timeRemaining === 0 && durationMinutes > 0
  };
}
