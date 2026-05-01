import type { ReactNode } from "react";

export function PageHero(props: {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="page-hero px-6 py-7 md:px-8">
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">{props.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{props.title}</h2>
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
