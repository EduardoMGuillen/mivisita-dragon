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
  enableResidentQrDateTime,
  enableResidentQrVehicleType,
  enableResidentQrVehicleCompanions,
  enableResidentDeliveryQr,
  enablePostaDeliveries,
  enableAutoDeleteSuspendedResidents,
}: {
  supportPhone: string;
  allowResidentQrSingleUse: boolean;
  allowResidentQrOneDay: boolean;
  allowResidentQrThreeDays: boolean;
  allowResidentQrInfinite: boolean;
  enableResidentQrDateTime: boolean;
  enableResidentQrVehicleType: boolean;
  enableResidentQrVehicleCompanions: boolean;
  enableResidentDeliveryQr: boolean;
  enablePostaDeliveries: boolean;
  enableAutoDeleteSuspendedResidents: boolean;
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

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Funcionalidades (por residencial)
        </p>
        <p className="text-xs text-slate-500">
          Estas opciones activan campos y validaciones adicionales. Por defecto vienen desactivadas.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="enableResidentQrDateTime" value="on" defaultChecked={enableResidentQrDateTime} />
          QR por fecha/hora + duracion (residentes)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="enableResidentQrVehicleType" value="on" defaultChecked={enableResidentQrVehicleType} />
          Tipo de vehiculo (residentes)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="enableResidentQrVehicleCompanions"
            value="on"
            defaultChecked={enableResidentQrVehicleCompanions}
          />
          Acompanantes en vehiculo (residentes)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="enableResidentDeliveryQr" value="on" defaultChecked={enableResidentDeliveryQr} />
          QR \"Pedidos/Delivery\" (residentes)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="enablePostaDeliveries" value="on" defaultChecked={enablePostaDeliveries} />
          Pedidos en posta (guardias)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="enableAutoDeleteSuspendedResidents"
            value="on"
            defaultChecked={enableAutoDeleteSuspendedResidents}
          />
          Auto-eliminar residentes suspendidos por 4 meses
        </label>
      </div>

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60 md:w-max">
        {isPending ? "Guardando..." : "Guardar configuracion"}
      </button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
