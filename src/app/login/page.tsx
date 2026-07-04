import { WEDDING } from "@/lib/wedding";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-brand-100 bg-white/80 p-8 text-center shadow-sm">
        {/* Monogram */}
        <div className="font-serif text-4xl font-semibold leading-none text-brand-600">
          A<span className="text-brand-300"> · </span>B
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-olive-600">
          Save the date
        </p>
        <h1 className="font-script text-5xl text-olive-700">
          {WEDDING.bride} &amp; {WEDDING.groom}
        </h1>
        <p className="mt-2 font-serif text-lg tracking-wide text-brand-600">
          {WEDDING.dateShort}
        </p>
        <p className="mt-3 text-xs uppercase tracking-widest text-gray-500">
          {WEDDING.venue}
        </p>
        <p className="text-xs uppercase tracking-widest text-gray-400">
          {WEDDING.city}
        </p>

        <div className="my-6 flex items-center gap-3 text-brand-200">
          <span className="h-px flex-1 bg-brand-100" />
          <span>❧</span>
          <span className="h-px flex-1 bg-brand-100" />
        </div>

        {error === "1" && (
          <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            Senha incorreta. Tente novamente.
          </p>
        )}
        {error === "config" && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            O aplicativo ainda não foi configurado (faltam as senhas no Vercel).
          </p>
        )}

        <form method="post" action="/api/login" className="space-y-3 text-left">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              placeholder="Digite a senha para entrar"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-500 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-600"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
