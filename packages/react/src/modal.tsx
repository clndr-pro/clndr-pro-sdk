'use client';

import React, { useEffect } from 'react';
import { BookingForm, BookingFormProps } from './components';

export interface BookingModalProps extends BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overlayClassName?: string;
  contentClassName?: string;
}

/**
 * A minimal modal that wraps `<BookingForm>`. Consumers using Shadcn can
 * instead render `<BookingForm>` inside their own `<Dialog>` component for
 * tighter design-system integration.
 */
export function BookingModal({
  open,
  onOpenChange,
  overlayClassName,
  contentClassName,
  ...formProps
}: BookingModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={overlayClassName}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      style={
        overlayClassName
          ? undefined
          : {
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2147483647,
              padding: 16,
            }
      }
    >
      <div
        className={contentClassName}
        style={
          contentClassName
            ? undefined
            : {
                background: '#fff',
                borderRadius: 8,
                padding: 24,
                width: '100%',
                maxWidth: 560,
                maxHeight: '90vh',
                overflow: 'auto',
              }
        }
      >
        <BookingForm {...formProps} onBooked={(id) => {
          formProps.onBooked?.(id);
          setTimeout(() => onOpenChange(false), 2500);
        }} />
      </div>
    </div>
  );
}
