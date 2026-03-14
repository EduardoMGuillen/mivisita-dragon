"use client";

import { useActionState } from "react";
import { acceptAnnouncedVisitAction } from "@/app/guard/actions";

const initialState: string | null = null;

export function GuardManualAcceptForm({
  qrId,
  hasVehicle,
}: {
  qrId: string;
  hasVehicle: boolean;
}) {
  const [message, formAction, isPending] = useActionState(acceptAnnouncedVisitAction, initialState);

  return (
    <form action={formAction} className="mt-2 grid gap-2">
      <input type="hidden" name="qrId" value={qrId} />
      <label className="grid gap-1 text-xs text-slate-600">
        Evidencia ID (obligatoria)
        <input
          type="file"
          name="idPhoto"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          required
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        />
      </label>
      {hasVehicle ? (
        <label className="grid gap-1 text-xs text-slate-600">
          Evidencia placa (obligatoria)
          <input
            type="file"
            name="platePhoto"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            required
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
          />
        </label>
      ) : null}
      <button
        disabled={isPending}
        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
      >
        {isPending ? "Registrando..." : "Aceptar llegada manualmente"}
      </button>
      {message ? <p className="text-xs text-slate-700">{message}</p> : null}
    </form>
  );
}
