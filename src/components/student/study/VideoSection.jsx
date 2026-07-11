import React, { useMemo } from 'react';
import { Play } from 'lucide-react';

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - Plain video ID string (11 chars, alphanumeric + dash/underscore)
 */
const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Plain video ID (11 characters, alphanumeric + dash + underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    // youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v');
    }

    // youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    // youtube.com/embed/ID or youtube.com/v/ID
    const embedMatch = parsed.pathname.match(/\/(embed|v)\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
      return embedMatch[2];
    }
  } catch {
    // Not a valid URL, ignore
  }

  return null;
};

const VideoSection = ({ videoUrl }) => {
  const videoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);

  if (!videoId) return null;

  return (
    <div className="video-section">
      <div className="video-section-header">
        <div className="video-section-icon">
          <Play className="h-5 w-5" />
        </div>
        <div>
          <h3 className="video-section-title">Video bài giảng</h3>
          <p className="video-section-subtitle">Xem video để hiểu rõ hơn nội dung bài học</p>
        </div>
      </div>

      <div className="video-section-player">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Video bài giảng"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="video-section-iframe"
        />
      </div>

      <style>{`
        .video-section {
          margin-top: 2rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
          transition: box-shadow 0.3s ease;
        }

        .video-section:hover {
          box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
        }

        .video-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          background: white;
        }

        .video-section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgb(239 68 68 / 0.25);
        }

        .video-section-title {
          font-size: 0.9375rem;
          font-weight: 900;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
        }

        .video-section-subtitle {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          margin: 0.125rem 0 0;
          line-height: 1.3;
        }

        .video-section-player {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background: #0f172a;
        }

        .video-section-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default VideoSection;
