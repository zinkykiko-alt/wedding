"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function parseGuest(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const companionsRaw = parseInt(String(formData.get("companions") ?? "0"), 10);
  const kidsRaw = parseInt(String(formData.get("kids") ?? "0"), 10);
  const companions = Math.min(2, Math.max(0, Number.isFinite(companionsRaw) ? companionsRaw : 0));
  const kids = Math.max(0, Number.isFinite(kidsRaw) ? kidsRaw : 0);
  const status = String(formData.get("status") ?? "TITULAR") === "BENCH" ? "BENCH" : "TITULAR";
  const sideRaw = String(formData.get("side") ?? "");
  const side = sideRaw === "ALICIA" || sideRaw === "BRUNO" ? sideRaw : "";
  return { name, companions, kids, status, side };
}

export async function createGuest(formData: FormData) {
  const guest = parseGuest(formData);
  if (!guest.name) return;
  await prisma.guest.create({ data: guest });
  revalidatePath("/convidados");
  redirect("/convidados");
}

export async function updateGuest(id: string, formData: FormData) {
  const guest = parseGuest(formData);
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
