"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton(props: {
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={props.className}
    >
      {pending ? props.pendingLabel || "Memproses..." : props.idleLabel}
    </button>
  );
}
