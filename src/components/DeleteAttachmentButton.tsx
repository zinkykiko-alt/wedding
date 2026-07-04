"use client";

import SubmitButton from "@/components/SubmitButton";

export default function DeleteAttachmentButton({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Remover este arquivo?")) e.preventDefault();
      }}
    >
      <SubmitButton
        pendingLabel="..."
        className="text-sm text-gray-400 hover:text-brand-600 disabled:opacity-60"
      >
        Remover
      </SubmitButton>
    </form>
  );
}
