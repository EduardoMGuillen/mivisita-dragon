"use client";

import { useActionState } from "react";
import { createManualVisitByGuardAction } from "@/app/guard/actions";

const initialState: string | null = null;

export function GuardManualEntryForm({
  residents,
}: {
  residents: Array<{ id: string; fullName: string }>;
}) {
  const [message, formAction, isPending] = useActionState(createManualVisitByGuardAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <select name="residentId" required className="field-base md:col-span-2">
        <option value="">Selecciona residente que anuncio la visita</option>
        {residents.map((resident) => (
          <option key={resident.id} value={resident.id}>
            {resident.fullName}
          </option>
        ))}
      </select>
      <input
        name="visitorName"
        required
        className="field-base md:col-span-2"
        placeholder="Nombre de la visita"
        maxLength={80}
      />
      <p className="text-xs text-slate-600 md:col-span-2">
        Se crea un QR de <strong>un solo uso</strong> a nombre del residente (misma ventana de vigencia que en la app).
        La <strong>entrada queda registrada al enviar</strong> con la evidencia de identificacion (y placa si aplica).
      </p>
      <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
        <input type="checkbox" name="hasVehicle" />
        La visita viene en vehiculo (evidencia de placa obligatoria).
      </label>
      <label className="grid gap-1 text-xs text-slate-600 md:col-span-2">
        Evidencia de identificacion del visitante (obligatoria)
        <input
          type="file"
          name="idPhoto"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          required
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        />
      </label>
      <label className="grid gap-1 text-xs text-slate-600 md:col-span-2">
        Evidencia de placa (obligatoria si marcaste vehiculo)
        <input
          type="file"
          name="platePhoto"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        />
      </label>
      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60 md:w-max">
        {isPending ? "Registrando entrada..." : "Registrar entrada (Posta)"}
      </button>
      {message ? <p className="text-sm text-slate-700 md:col-span-2">{message}</p> : null}
    </form>
  );
}
