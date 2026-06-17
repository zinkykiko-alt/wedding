export default function ComingSoon({
  emoji,
  title,
}: {
  emoji: string;
  title: string;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <div className="rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center">
        <div className="text-4xl">{emoji}</div>
        <p className="mt-3 font-medium text-gray-700">Em construção</p>
        <p className="mt-1 text-sm text-gray-500">
          Esta seção será montada nos próximos passos.
        </p>
      </div>
    </div>
  );
}
