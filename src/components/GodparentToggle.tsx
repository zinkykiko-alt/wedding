"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setGodparent } from "@/app/(app)/convidados/actions";

export default function GodparentToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={active}
      title={
        active
          ? "Padrinho/Madrinha — clique para desmarcar"
          : "Marcar como padrinho/madrinha"
      }
      onClick={() =>
        startTransition(async () => {
          await setGodparent(id, !active);
          router.refresh();
        })
      }
      className={`shrink-0 rounded-full p-1.5 text-lg leading-none transition-colors disabled:opacity-50 ${
        active ? "text-amber-500" : "text-gray-300 hover:text-amber-400"
      }`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
