import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/**
 * Reusable Cloudflare Turnstile CAPTCHA widget.
 *
 * Turnstile is a non-intrusive, privacy-friendly alternative to reCAPTCHA.
 * It auto-verifies in the background — NO image puzzles, NO grid selections.
 *
 * Usage:
 *   const captchaRef = useRef(null);
 *   const [captchaToken, setCaptchaToken] = useState(null);
 *
 *   <CaptchaWidget ref={captchaRef} onVerify={setCaptchaToken} />
 *
 * After form submit failure, call captchaRef.current?.reset() to reset.
 * Pass `captchaToken` in the request body for backend verification.
 */
const CaptchaWidget = forwardRef(function CaptchaWidget({ onVerify, className = '' }, ref) {
  const turnstileRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      turnstileRef.current?.reset();
      onVerify?.(null);
    },
  }));

  const handleSuccess = useCallback(
    (token) => {
      onVerify?.(token);
    },
    [onVerify]
  );

  const handleExpire = useCallback(() => {
    onVerify?.(null);
  }, [onVerify]);

  const handleError = useCallback(() => {
    onVerify?.(null);
  }, [onVerify]);

  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={handleSuccess}
        onExpire={handleExpire}
        onError={handleError}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
});

export default CaptchaWidget;
