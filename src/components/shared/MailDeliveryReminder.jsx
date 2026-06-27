import { SPAM_FOLDER_REMINDER } from '@/constants/mail';

export default function MailDeliveryReminder({ className = '' }) {
  return (
    <p className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800 ${className}`}>
      {SPAM_FOLDER_REMINDER}
    </p>
  );
}
