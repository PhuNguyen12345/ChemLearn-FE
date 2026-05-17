import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * LabConfirmDialog – Generic confirmation modal (reusable).
 * Used for Reset Lab and can be reused for Submit Lab later.
 *
 * Props:
 *   isOpen           – boolean to show/hide the dialog
 *   icon             – React node to render inside the icon circle
 *   iconBgColor      – Tailwind bg class for the icon circle  e.g. 'bg-red-100'
 *   iconColor        – Tailwind text class for the icon        e.g. 'text-red-500'
 *   title            – dialog heading text
 *   message          – dialog body text
 *   confirmLabel     – label for the confirm button
 *   confirmClassName – Tailwind classes for the confirm button
 *   onConfirm        – callback when user clicks Confirm
 *   onCancel         – callback when user clicks Cancel
 */
const LabConfirmDialog = ({
  isOpen,
  icon,
  iconBgColor = 'bg-red-100',
  iconColor = 'text-red-500',
  title = 'Bạn có chắc không?',
  message = 'Hành động này không thể hoàn tác.',
  confirmLabel = 'Xác nhận',
  confirmClassName = 'bg-red-500 hover:bg-red-600 text-white',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5">
        {/* Icon circle */}
        {icon && (
          <div className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center`}>
            <span className={iconColor}>{icon}</span>
          </div>
        )}

        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={onCancel}
          >
            Huỷ
          </Button>
          <Button
            className={`flex-1 h-11 ${confirmClassName}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LabConfirmDialog;
