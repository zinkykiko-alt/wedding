"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setGuestFlag } from "@/app/(app)/convidados/actions";

export default function FlagToggle({
  id,
  flag,
  active,
  iconOn,
  iconOff,
  activeClass,
  titleOn,
  titleOff,
}: {
  id: string;
  flag: "godparent" | "parent";
  active: boolean;
  iconOn: string;
  iconOff: string;
  activeClass: string;
  titleOn: string;
  titleOff: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={active}
      title={active ? titleOn : titleOff}
      onClick={() =>
        startTransition(async () => {
          await setGuestFlag(id, flag, !active);
          router.refresh();
        })
      }
      className={`shrink-0 rounded-full p-1 text-lg leading-none transition-colors disabled:opacity-50 ${
        active ? activeClass : "text-gray-300 hover:text-gray-400"
      }`}
    >
      {active ? iconOn : iconOff}
    </button>
  );
}
