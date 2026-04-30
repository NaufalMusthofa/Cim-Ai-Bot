export function StatCard(props: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="rounded-panel border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur">
      <p className="text-sm uppercase tracking-[0.18em] text-ember/70">{props.label}</p>
      <p className="mt-4 font-display text-4xl text-ink">{props.value}</p>
      <p className="mt-2 text-sm text-ink/65">{props.hint}</p>
    </article>
  );
}
