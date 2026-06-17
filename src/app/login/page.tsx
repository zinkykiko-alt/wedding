type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">💍</div>
          <h1 className="text-xl font-semibold text-gray-900">
            Planejador de Casamento
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Digite a senha para acessar.
          </p>
        </div>

        {error === "1" && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Senha incorreta. Tente novamente.
          </p>
        )}
        {error === "config" && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            O aplicativo ainda não foi configurado (faltam as senhas no Vercel).
          </p>
        )}

        <form method="post" action="/api/login" className="space-y-4">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-rose-500 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-600"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
