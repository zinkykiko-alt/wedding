import Link from "next/link";
import NavLinks from "@/components/NavLinks";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">💍</span>
              <span className="font-semibold text-gray-900">
                Planejador de Casamento
              </span>
            </Link>
            <form method="post" action="/api/logout" className="sm:hidden">
              <button
                type="submit"
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:text-rose-700"
              >
                Sair
              </button>
            </form>
          </div>
          <div className="flex items-center gap-3">
            <NavLinks />
            <form method="post" action="/api/logout" className="hidden sm:block">
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-rose-700"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-rose-100 px-4 py-4 text-center text-xs text-gray-400">
        Feito com carinho para o seu grande dia.
      </footer>
    </div>
  );
}
