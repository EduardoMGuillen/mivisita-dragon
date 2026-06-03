"use client";

import { useActionState, useState, type FormEvent } from "react";
import { EvidencePhotoField } from "@/app/components/evidence-photo-field";
import { acceptAnnouncedVisitAction } from "@/app/guard/actions";
import { optimizeEvidencePhoto } from "@/lib/optimize-image-upload";

const initialState: string | null = null;

export function GuardManualAcceptForm({
  qrId,
  hasVehicle,
}: {
  qrId: string;
  hasVehicle: boolean;
}) {
  const [message, formAction, isPending] = useActionState(acceptAnnouncedVisitAction, initialState);
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
        setSubmitError("Debes capturar la evidencia de identificacion.");
        return;
      }
      formData.set("idPhoto", await optimizeEvidencePhoto(idPhoto));

      if (hasVehicle) {
        const platePhoto = formData.get("platePhoto");
        if (!(platePhoto instanceof File) || platePhoto.size <= 0) {
          setSubmitError("Debes capturar la evidencia de placa.");
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
    <form
      onSubmit={(event) => void handleSubmit(event)}
      encType="multipart/form-data"
      className="mt-2 grid gap-2"
    >
      <input type="hidden" name="qrId" value={qrId} />
      <EvidencePhotoField name="idPhoto" label="Evidencia ID (obligatoria)" required />
      {hasVehicle ? (
        <EvidencePhotoField name="platePhoto" label="Evidencia placa (obligatoria)" required />
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
      >
        {isPreparing ? "Preparando fotos..." : isPending ? "Registrando..." : "Aceptar llegada manualmente"}
      </button>
      {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}
      {message ? <p className="text-xs text-slate-700">{message}</p> : null}
    </form>
  );
}
