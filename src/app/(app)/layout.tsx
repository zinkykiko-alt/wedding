import Link from "next/link";
import NavLinks from "@/components/NavLinks";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-brand-100 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-semibold text-brand-600">
                A · B
              </span>
              <span className="font-script text-2xl leading-none text-olive-700">
                Alícia &amp; Bruno
              </span>
            </Link>
            <form method="post" action="/api/logout" className="sm:hidden">
              <button
                type="submit"
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:text-brand-700"
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
                className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-brand-700"
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

      <footer className="border-t border-brand-100 px-4 py-4 text-center text-xs text-gray-400">
        Feito com carinho para o seu grande dia.
      </footer>
    </div>
  );
}
