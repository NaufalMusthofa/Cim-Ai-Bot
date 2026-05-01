import clsx from "clsx";
import type { ReactNode } from "react";

const TONE_CLASSES = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700"
} as const;

export function StatCard(props: {
  label: string;
  value: string | number;
  hint: string;
  icon?: ReactNode;
  tone?: keyof typeof TONE_CLASSES;
}) {
  const tone = props.tone || "blue";

  return (
    <article className="surface-card relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-slate-100/80 via-white/10 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="relative">
          <p className="text-sm font-medium text-slate-500">{props.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{props.value}</p>
        </div>
        <span
          className={clsx(
            "relative inline-flex h-12 w-12 items-center justify-center rounded-2xl",
            TONE_CLASSES[tone]
          )}
        >
          {props.icon || <span className="h-2.5 w-2.5 rounded-full bg-current" />}
        </span>
      </div>
      <p className="relative mt-3 text-sm leading-6 text-slate-500">{props.hint}</p>
    </article>
  );
}
