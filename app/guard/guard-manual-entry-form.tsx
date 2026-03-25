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
        Se genera un QR de <strong>un solo uso</strong>, con la misma vigencia que si el residente lo crea desde la app
        (hasta 3 dias para escanear una vez en porteria).
      </p>
      <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
        <input type="checkbox" name="hasVehicle" />
        La visita viene en vehiculo (se pedira evidencia de placa al registrar).
      </label>
      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60 md:w-max">
        {isPending ? "Creando entrada..." : "Crear entrada manual"}
      </button>
      {message ? <p className="text-sm text-slate-700 md:col-span-2">{message}</p> : null}
    </form>
  );
}
