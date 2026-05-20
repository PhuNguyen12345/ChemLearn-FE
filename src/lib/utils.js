import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatInstantToLocale(value, fallback = "-") {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleString();
}

export function instantToDatetimeLocal(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const year = parsed.getFullYear();
  const month = pad(parsed.getMonth() + 1);
  const day = pad(parsed.getDate());
  const hours = pad(parsed.getHours());
  const minutes = pad(parsed.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatRelativeTime(isoString, prefix = "Đã sửa") {
  if (!isoString) return "";
  
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return "";

  const timeMs = parsed.getTime();
  const deltaMs = timeMs - Date.now();
  const deltaSeconds = Math.round(deltaMs / 1000);
  const deltaMinutes = Math.round(deltaSeconds / 60);
  const deltaHours = Math.round(deltaMinutes / 60);
  const deltaDays = Math.round(deltaHours / 24);

  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

  let timeString = '';
  if (Math.abs(deltaDays) >= 1) {
    timeString = rtf.format(deltaDays, 'day');
  } else if (Math.abs(deltaHours) >= 1) {
    timeString = rtf.format(deltaHours, 'hour');
  } else if (Math.abs(deltaMinutes) >= 1) {
    timeString = rtf.format(deltaMinutes, 'minute');
  } else {
    return prefix ? `${prefix} vừa xong` : 'vừa xong';
  }
  
  return prefix ? `${prefix} ${timeString}` : timeString;
}
