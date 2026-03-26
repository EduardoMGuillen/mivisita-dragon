"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function PendingSubmitButton({
  children,
  pendingText,
  className,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText ?? "Procesando..." : children}
    </button>
  );
}

export function ConfirmPendingSubmitButton({
  children,
  pendingText,
  confirmMessage,
  className,
}: {
  children: ReactNode;
  pendingText?: string;
  confirmMessage: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (pending) return;
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingText ?? "Procesando..." : children}
    </button>
  );
}

