import type { ReactNode } from "react";

export function PageHero(props: {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="panel overflow-hidden p-8 lg:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{props.eyebrow}</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-slate-950 lg:text-5xl">{props.title}</h2>
          {props.description ? (
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 lg:text-lg">{props.description}</p>
          ) : null}
          {props.meta ? <div className="mt-5 flex flex-wrap items-center gap-3">{props.meta}</div> : null}
        </div>

        {props.actions ? <div className="flex flex-wrap items-center gap-3">{props.actions}</div> : null}
      </div>
    </section>
  );
}
