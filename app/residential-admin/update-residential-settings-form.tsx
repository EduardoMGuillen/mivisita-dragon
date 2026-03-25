"use client";

import { useActionState } from "react";
import { updateResidentialSettingsAction } from "@/app/residential-admin/actions";

const initialState: string | null = null;

export function UpdateResidentialSettingsForm({
  supportPhone,
  allowResidentQrSingleUse,
  allowResidentQrOneDay,
  allowResidentQrThreeDays,
  allowResidentQrInfinite,
}: {
  supportPhone: string;
  allowResidentQrSingleUse: boolean;
  allowResidentQrOneDay: boolean;
  allowResidentQrThreeDays: boolean;
  allowResidentQrInfinite: boolean;
}) {
  const [message, formAction, isPending] = useActionState(updateResidentialSettingsAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:max-w-lg">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Numero de contacto (WhatsApp soporte)
      </label>
      <input
        name="supportPhone"
        className="field-base"
        placeholder="Ej: 50499999999"
        defaultValue={supportPhone}
        required
      />

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Vigencias QR permitidas a residentes
        </p>
        <p className="text-xs text-slate-500">
          Los administradores y QR de administracion no se ven afectados por esta politica.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="allowResidentQrSingleUse" value="on" defaultChecked={allowResidentQrSingleUse} />
          1 solo uso
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="allowResidentQrOneDay" value="on" defaultChecked={allowResidentQrOneDay} />
          Valido por 1 dia
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="allowResidentQrThreeDays" value="on" defaultChecked={allowResidentQrThreeDays} />
          Hasta 3 dias
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="allowResidentQrInfinite" value="on" defaultChecked={allowResidentQrInfinite} />
          Sin vencimiento (infinito)
        </label>
      </div>

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60 md:w-max">
        {isPending ? "Guardando..." : "Guardar configuracion"}
      </button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
