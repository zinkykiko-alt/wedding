import Link from "next/link";

const sections = [
  {
    href: "/fornecedores",
    emoji: "📋",
    title: "Fornecedores",
    description: "Cadastre buffet, espaço, fotógrafo e acompanhe os pagamentos.",
  },
  {
    href: "/calendario",
    emoji: "📅",
    title: "Calendário de pagamentos",
    description: "Veja as datas de vencimento e o que está atrasado ou próximo.",
  },
  {
    href: "/convidados",
    emoji: "👰",
    title: "Lista de convidados",
    description: "Controle confirmados, acompanhantes, crianças e a reserva.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-rose-100 bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Bem-vindo(a) ao seu planejador 💍
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Aqui você organiza tudo do casamento em um só lugar: fornecedores,
          pagamentos e convidados. Em breve este painel mostrará um resumo
          financeiro completo.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-rose-100 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">{section.emoji}</div>
            <h2 className="mt-2 font-semibold text-gray-900">{section.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{section.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
