"use client";

import { useFormStatus } from "react-dom";

// A submit button that disables itself while the form's action is running.
// This prevents accidental double-submits (e.g. double-clicking "Salvar"
// creating two records).
export default function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
