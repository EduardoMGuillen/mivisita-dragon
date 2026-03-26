"use client";

import { useActionState, useMemo, useState } from "react";
import { createDeliveryQrAction, createInviteQrAction } from "@/app/resident/actions";

const initialState: string | null = null;

type ValidityType = "SINGLE_USE" | "ONE_DAY" | "THREE_DAYS" | "INFINITE";
type QrCategory = "VISIT" | "DELIVERY";
type VehicleType = "CARRO" | "MOTO" | "MICROBUS" | "CAMION" | "TAXI";

const VALIDITY_LABELS: Record<ValidityType, string> = {
  SINGLE_USE: "1 solo uso",
  ONE_DAY: "Valido por 1 dia",
  THREE_DAYS: "Valido por maximo 3 dias",
  INFINITE: "Validez infinita (sin vencimiento)",
};

const VEHICLE_LABELS: Record<VehicleType, string> = {
  CARRO: "Carro",
  MOTO: "Moto",
  MICROBUS: "Microbus",
  CAMION: "Camion",
  TAXI: "Taxi",
};

export function CreateQrForm({
  allowedValidityTypes,
  enableResidentQrDateTime,
  enableResidentQrVehicleType,
  enableResidentQrVehicleCompanions,
  enableResidentDeliveryQr,
}: {
  allowedValidityTypes: ValidityType[];
  enableResidentQrDateTime: boolean;
  enableResidentQrVehicleType: boolean;
  enableResidentQrVehicleCompanions: boolean;
  enableResidentDeliveryQr: boolean;
}) {
  const [category, setCategory] = useState<QrCategory>("VISIT");
  const [hasVehicle, setHasVehicle] = useState<"yes" | "no">("no");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const isDelivery = category === "DELIVERY";

  const [visitMessage, visitAction, visitPending] = useActionState(createInviteQrAction, initialState);
  const [deliveryMessage, deliveryAction, deliveryPending] = useActionState(createDeliveryQrAction, initialState);
  const message = isDelivery ? deliveryMessage : visitMessage;
  const isPending = isDelivery ? deliveryPending : visitPending;
  const formAction = isDelivery ? deliveryAction : visitAction;

  const validityOptions = allowedValidityTypes;
  const hasAllowedValidity = validityOptions.length > 0;

  const showSchedule = isDelivery || (enableResidentQrDateTime && scheduleEnabled);
  const showLegacyValidity = !isDelivery && (!enableResidentQrDateTime || !scheduleEnabled);
  const showVehicleFields = !isDelivery && hasVehicle === "yes";
  const showVehicleType = showVehicleFields && enableResidentQrVehicleType;
  const showVehicleCompanions = showVehicleFields && enableResidentQrVehicleCompanions;

  const canSubmit = useMemo(() => {
    if (isDelivery) return true;
    if (showLegacyValidity) return hasAllowedValidity;
    return true;
  }, [hasAllowedValidity, isDelivery, showLegacyValidity]);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      {enableResidentDeliveryQr ? (
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-600 md:col-span-2">
          Tipo de QR
          <select
            name="category"
            value={category}
            onChange={(e) => {
              const next = e.target.value === "DELIVERY" ? "DELIVERY" : "VISIT";
              setCategory(next);
              if (next === "DELIVERY") {
                setHasVehicle("no");
                setScheduleEnabled(true);
              }
            }}
            className="field-base"
          >
            <option value="VISIT">Visita</option>
            <option value="DELIVERY">Pedidos/Delivery</option>
          </select>
        </label>
      ) : (
        <input type="hidden" name="category" value="VISIT" />
      )}

      <input
        name="visitorName"
        required
        placeholder={isDelivery ? "Nombre del repartidor / empresa" : "Nombre de la visita"}
        className="field-base md:col-span-2"
      />

      {!isDelivery ? (
        <input
          name="description"
          placeholder="Descripcion (opcional)"
          className="field-base md:col-span-2"
          maxLength={180}
        />
      ) : (
        <input type="hidden" name="description" value="" />
      )}

      {enableResidentQrDateTime && !isDelivery ? (
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
          <input
            type="checkbox"
            name="scheduleEnabled"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
          />
          Programar por fecha/hora y duracion (horas)
        </label>
      ) : null}

      {showSchedule ? (
        <>
          <label className="grid gap-1 text-xs text-slate-600 md:col-span-1">
            Inicio (fecha y hora)
            <input name="startsAt" type="datetime-local" required className="field-base" />
          </label>
          <label className="grid gap-1 text-xs text-slate-600 md:col-span-1">
            Duracion (horas)
            <input name="durationHours" type="number" min={1} max={72} step={1} required className="field-base" />
          </label>
          {isDelivery ? (
            <p className="text-xs text-slate-600 md:col-span-2">
              Este QR es de <strong>1 solo uso</strong> y en posta se pedira evidencia de <strong>ID y placa</strong>.
            </p>
          ) : (
            <p className="text-xs text-slate-600 md:col-span-2">
              Este QR sera de <strong>1 solo uso</strong> dentro de la ventana programada.
            </p>
          )}
        </>
      ) : null}

      {showLegacyValidity ? (
        hasAllowedValidity ? (
          <select name="validityType" defaultValue={validityOptions[0]} className="field-base">
            {validityOptions.map((option) => (
              <option key={option} value={option}>
                {VALIDITY_LABELS[option]}
              </option>
            ))}
          </select>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Sin vigencias habilitadas
          </p>
        )
      ) : (
        <input type="hidden" name="validityType" value="SINGLE_USE" />
      )}

      {!isDelivery ? (
        <select
          name="hasVehicle"
          value={hasVehicle}
          onChange={(e) => setHasVehicle(e.target.value === "yes" ? "yes" : "no")}
          className="field-base"
        >
          <option value="no">Acceso peatonal</option>
          <option value="yes">Vehiculo</option>
        </select>
      ) : (
        <input type="hidden" name="hasVehicle" value="no" />
      )}

      {showVehicleType ? (
        <label className="grid gap-1 text-xs text-slate-600 md:col-span-1">
          Tipo de vehiculo
          <select name="vehicleType" defaultValue="CARRO" className="field-base" required>
            {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((key) => (
              <option key={key} value={key}>
                {VEHICLE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="vehicleType" value="" />
      )}

      {showVehicleCompanions ? (
        <label className="grid gap-1 text-xs text-slate-600 md:col-span-1">
          Acompanantes (sin conductor)
          <input name="vehicleCompanionsCount" type="number" min={0} max={20} step={1} required className="field-base" />
        </label>
      ) : (
        <input type="hidden" name="vehicleCompanionsCount" value="" />
      )}

      <button
        type="submit"
        disabled={isPending || !canSubmit}
        className="btn-primary disabled:opacity-60 md:col-span-2 md:w-max"
      >
        {isPending ? "Generando..." : isDelivery ? "Generar QR de Delivery" : "Generar QR"}
      </button>

      {!canSubmit && !isDelivery ? (
        <p className="text-sm text-amber-700 md:col-span-2">
          La administracion desactivo temporalmente todas las vigencias QR para residentes.
        </p>
      ) : null}

      {message ? <p className="text-sm text-slate-700 md:col-span-2">{message}</p> : null}
    </form>
  );
}
