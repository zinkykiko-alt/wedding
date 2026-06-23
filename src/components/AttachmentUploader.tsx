"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ATTACHMENT_LABELS } from "@/lib/constants";

// Vercel limits a serverless request body to ~4.5 MB; cap a little under that.
const MAX_BYTES = 4.4 * 1024 * 1024;

export default function AttachmentUploader({
  supplierId,
}: {
  supplierId: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("CONTRACT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Escolha um arquivo para enviar.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        "Arquivo muito grande (máximo cerca de 4 MB por enquanto). Tente um arquivo menor.",
      );
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("supplierId", supplierId);
      fd.set("label", label);

      const res = await fetch("/api/attachments", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Falha no envio.");
      }

      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar o arquivo. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 p-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          >
            {ATTACHMENT_LABELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Arquivo (PDF ou imagem)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-rose-700 hover:file:bg-rose-200"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-rose-500 px-4 py-2 font-medium text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Enviando..." : "Enviar arquivo"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </form>
  );
}
