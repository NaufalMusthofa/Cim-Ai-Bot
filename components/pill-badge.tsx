import clsx from "clsx";

const TONE_CLASSES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200/80",
  blue: "bg-blue-100 text-blue-700 ring-blue-200/80",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
  amber: "bg-amber-100 text-amber-700 ring-amber-200/80",
  violet: "bg-violet-100 text-violet-700 ring-violet-200/80",
  rose: "bg-rose-100 text-rose-700 ring-rose-200/80"
} as const;

export function PillBadge(props: {
  label: string;
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  const tone = props.tone || "slate";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1",
        TONE_CLASSES[tone],
        props.className
      )}
    >
      {props.label}
    </span>
  );
}
