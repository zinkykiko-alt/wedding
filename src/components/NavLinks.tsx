"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Painel" },
  { href: "/fornecedores", label: "Fornecedores" },
  { href: "/calendario", label: "Calendário" },
  { href: "/convidados", label: "Convidados" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-rose-500 text-white"
                : "text-gray-600 hover:bg-rose-100 hover:text-rose-700"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
