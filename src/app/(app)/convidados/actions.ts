"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type GuestInput = {
  name: string;
  phone: string;
  companions: number;
  kids: number;
  status: string;
  side: string;
};

function normalize(input: {
  name?: unknown;
  phone?: unknown;
  companions?: unknown;
  kids?: unknown;
  status?: unknown;
  side?: unknown;
}): GuestInput {
  const name = String(input.name ?? "").trim();
  const phone = String(input.phone ?? "").trim().slice(0, 40);
  const companionsRaw = parseInt(String(input.companions ?? "0"), 10);
  const kidsRaw = parseInt(String(input.kids ?? "0"), 10);
  const companions = Math.min(2, Math.max(0, Number.isFinite(companionsRaw) ? companionsRaw : 0));
  const kids = Math.max(0, Number.isFinite(kidsRaw) ? kidsRaw : 0);
  const status = String(input.status ?? "TITULAR") === "BENCH" ? "BENCH" : "TITULAR";
  const sideRaw = String(input.side ?? "");
  const side = sideRaw === "ALICIA" || sideRaw === "BRUNO" ? sideRaw : "";
  return { name, phone, companions, kids, status, side };
}

function fromForm(formData: FormData) {
  return normalize({
    name: formData.get("name"),
    phone: formData.get("phone"),
    companions: formData.get("companions"),
    kids: formData.get("kids"),
    status: formData.get("status"),
    side: formData.get("side"),
  });
}

// Quick-add: create a guest and stay on the page (called directly from the
// inline form; no redirect).
export async function addGuest(input: {
  name: string;
  phone: string;
  companions: number;
  kids: number;
  status: string;
  side: string;
}): Promise<{ ok: boolean }> {
  const guest = normalize(input);
  if (!guest.name) return { ok: false };
  await prisma.guest.create({ data: guest });
  revalidatePath("/convidados");
  return { ok: true };
}

export async function createGuest(formData: FormData) {
  const guest = fromForm(formData);
  if (!guest.name) return;
  await prisma.guest.create({ data: guest });
  revalidatePath("/convidados");
  redirect("/convidados");
}

export async function updateGuest(id: string, formData: FormData) {
  const guest = fromForm(formData);
  if (!guest.name) return;
  await prisma.guest.update({ where: { id }, data: guest });
  revalidatePath("/convidados");
  redirect("/convidados");
}

export async function deleteGuest(id: string) {
  await prisma.guest.delete({ where: { id } });
  revalidatePath("/convidados");
  redirect("/convidados");
}
