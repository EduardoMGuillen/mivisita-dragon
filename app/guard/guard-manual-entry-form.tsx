"use client";

import { useActionState, useState, type FormEvent } from "react";
import { EvidencePhotoField } from "@/app/components/evidence-photo-field";
import { createManualVisitByGuardAction } from "@/app/guard/actions";
import { optimizeEvidencePhoto } from "@/lib/optimize-image-upload";

const initialState: string | null = null;

export function GuardManualEntryForm({
  residents,
  enableVehicleType,
  enableVehicleCompanions,
}: {
  residents: Array<{ id: string; fullName: string }>;
  enableVehicleType: boolean;
  enableVehicleCompanions: boolean;
}) {
  const [message, formAction, isPending] = useActionState(createManualVisitByGuardAction, initialState);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setIsPreparing(true);

      const idPhoto = formData.get("idPhoto");
      if (!(idPhoto instanceof File) || idPhoto.size <= 0) {
        setSubmitError("Debes capturar la evidencia de identificacion del visitante.");
        return;
      }
      formData.set("idPhoto", await optimizeEvidencePhoto(idPhoto));

      const hasVehicleChecked = formData.get("hasVehicle") === "on";
      if (hasVehicleChecked) {
        const platePhoto = formData.get("platePhoto");
        if (!(platePhoto instanceof File) || platePhoto.size <= 0) {
          setSubmitError("Debes capturar la evidencia de placa porque la visita viene en vehiculo.");
          return;
        }
        formData.set("platePhoto", await optimizeEvidencePhoto(platePhoto));
      } else {
        formData.delete("platePhoto");
      }

      formAction(formData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo preparar las fotos.");
    } finally {
      setIsPreparing(false);
    }
  }

  const busy = isPending || isPreparing;

  return (
    <form onSubmit={(event) => void handleSubmit(event)} encType="multipart/form-data" className="grid gap-3 md:grid-cols-2">
      <select name="residentId" required className="field-base md:col-span-2" disabled={busy}>
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
        disabled={busy}
      />
      <p className="text-xs text-slate-600 md:col-span-2">
        Se crea un QR de <strong>un solo uso</strong> a nombre del residente (misma ventana de vigencia que en la app).
        La <strong>entrada queda registrada al enviar</strong> con la evidencia de identificacion (y placa si aplica).
      </p>
      <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
        <input
          type="checkbox"
          name="hasVehicle"
          checked={hasVehicle}
          onChange={(event) => setHasVehicle(event.target.checked)}
          disabled={busy}
        />
        La visita viene en vehiculo (evidencia de placa obligatoria).
      </label>

      {hasVehicle && enableVehicleType ? (
        <label className="grid gap-1 text-xs text-slate-600 md:col-span-1">
          Tipo de vehiculo
          <select name="vehicleType" defaultValue="CARRO" className="field-base" required disabled={busy}>
            <option value="CARRO">Carro</option>
            <option value="MOTO">Moto</option>
            <option value="MICROBUS">Microbus</option>
            <option value="CAMION">Camion</option>
            <option value="TAXI">Taxi</option>
          </select>
        </label>
      ) : (
        <input type="hidden" name="vehicleType" value="" />
      )}

      {hasVehicle && enableVehicleCompanions ? (
        <label className="grid gap-1 text-xs text-slate-600 md:col-span-1">
          Acompanantes (sin conductor)
          <input
            name="vehicleCompanionsCount"
            type="number"
            min={0}
            max={20}
            step={1}
            required
            className="field-base"
            disabled={busy}
          />
        </label>
      ) : (
        <input type="hidden" name="vehicleCompanionsCount" value="" />
      )}

      <EvidencePhotoField
        name="idPhoto"
        label="Evidencia de identificacion del visitante (obligatoria)"
        required
      />
      <EvidencePhotoField
        name="platePhoto"
        label="Evidencia de placa (obligatoria si marcaste vehiculo)"
        required={hasVehicle}
      />

      <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60 md:w-max">
        {isPreparing ? "Preparando fotos..." : isPending ? "Registrando entrada..." : "Registrar entrada (Posta)"}
      </button>

      {submitError ? <p className="text-sm text-red-600 md:col-span-2">{submitError}</p> : null}
      {message ? <p className="text-sm text-slate-700 md:col-span-2">{message}</p> : null}
    </form>
  );
}
