"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { ATTACHMENT_LABELS } from "@/lib/constants";
import { saveAttachment } from "@/app/(app)/fornecedores/attachments-actions";

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

    setBusy(true);
    try {
      const blob = await upload(file.name, file, {
        access: "private",
        handleUploadUrl: "/api/attachments/upload",
        clientPayload: JSON.stringify({ supplierId, label }),
        contentType: file.type || undefined,
      });

      await saveAttachment({
        supplierId,
        label,
        fileName: file.name,
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type || "",
        size: file.size,
      });

      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setError(
        "Não foi possível enviar o arquivo. Verifique o tipo/tamanho e tente novamente.",
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
