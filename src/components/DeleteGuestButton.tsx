"use client";

import SubmitButton from "@/components/SubmitButton";

export default function DeleteGuestButton({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Remover este convidado?")) e.preventDefault();
      }}
    >
      <SubmitButton
        pendingLabel="Excluindo..."
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Excluir convidado
      </SubmitButton>
    </form>
  );
}
