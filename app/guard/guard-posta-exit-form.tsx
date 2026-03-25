"use client";

import { useActionState } from "react";
import { markPostaVisitExitAction } from "@/app/guard/actions";

const initialState: string | null = null;

export function GuardPostaExitForm({
  scanId,
  visitorName,
}: {
  scanId: string;
  visitorName: string;
}) {
  const [message, formAction, isPending] = useActionState(markPostaVisitExitAction, initialState);

  return (
    <form action={formAction} className="mt-2 grid gap-2 border-t border-slate-200 pt-2">
      <input type="hidden" name="scanId" value={scanId} />
      <label className="grid gap-1 text-xs text-slate-600">
        Nota de salida (opcional)
        <input
          name="exitNote"
          maxLength={200}
          placeholder="Ej: Salida por porton principal"
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {isPending ? "Registrando salida..." : `Marcar salida — ${visitorName}`}
      </button>
      {message ? <p className="text-xs text-slate-700">{message}</p> : null}
    </form>
  );
}
