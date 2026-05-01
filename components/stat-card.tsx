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
    <article className="metric-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{props.label}</p>
          <p className="mt-4 font-display text-4xl text-slate-950">{props.value}</p>
        </div>
        <span
          className={clsx(
            "inline-flex h-14 w-14 items-center justify-center rounded-2xl",
            TONE_CLASSES[tone]
          )}
        >
          {props.icon || <span className="h-2.5 w-2.5 rounded-full bg-current" />}
        </span>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-600">{props.hint}</p>
    </article>
  );
}
