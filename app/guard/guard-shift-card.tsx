"use client";

import { useActionState, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  endGuardShiftAction,
  markGuardShiftHeartbeatAction,
  startGuardShiftAction,
} from "@/app/guard/actions";

const initialState: string | null = null;
const MAX_IMAGE_UPLOAD_BYTES = 600 * 1024;

function fileNameToJpeg(name: string) {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return `${name}.jpg`;
  return `${name.slice(0, lastDot)}.jpg`;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("No se pudo leer la selfie."));
    };
    image.src = imageUrl;
  });
}

async function canvasToJpegBlob(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la compresion de selfie.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", quality);
  });
  if (!blob) throw new Error("No se pudo convertir la selfie.");
  return blob;
}

async function optimizeImageForUpload(file: File, maxBytes = MAX_IMAGE_UPLOAD_BYTES): Promise<File> {
  if (file.size > 0 && file.size <= maxBytes && file.type === "image/jpeg") {
    return file;
  }

  const image = await loadImageElement(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const initialScale = longestSide > 1280 ? 1280 / longestSide : 1;
  let scale = initialScale;
  let quality = 0.8;
  let bestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const candidateBlob = await canvasToJpegBlob(image, width, height, quality);
    bestBlob = candidateBlob;
    if (candidateBlob.size <= maxBytes) {
      return new File([candidateBlob], fileNameToJpeg(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }

    if (quality > 0.45) {
      quality -= 0.1;
    } else {
      scale *= 0.8;
    }
  }

  if (!bestBlob) throw new Error("No se pudo optimizar la selfie.");
  return new File([bestBlob], fileNameToJpeg(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function formatCountdown(targetIso: string | null) {
  if (!targetIso) return "Sin turno activo";
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return "Checkpoint vencido";
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function GuardShiftCard({
  hasOpenShift,
  nextHeartbeatAtIso,
  heartbeatOverdue,
}: {
  hasOpenShift: boolean;
  nextHeartbeatAtIso: string | null;
  heartbeatOverdue: boolean;
}) {
  const [startMessage, startAction, startPending] = useActionState(startGuardShiftAction, initialState);
  const [markMessage, markAction, markPending] = useActionState(markGuardShiftHeartbeatAction, initialState);
  const [endMessage, endAction, endPending] = useActionState(endGuardShiftAction, initialState);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [startSelfieError, setStartSelfieError] = useState<string | null>(null);
  const [markSelfieError, setMarkSelfieError] = useState<string | null>(null);
  const [endSelfieError, setEndSelfieError] = useState<string | null>(null);
  const [lastCheckpointAlertKey, setLastCheckpointAlertKey] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nextHeartbeatAtIso) {
      setLastCheckpointAlertKey(null);
      return;
    }

    const maybeNotify = () => {
      if (!hasOpenShift) return;
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const checkpointAt = new Date(nextHeartbeatAtIso).getTime();
      if (Number.isNaN(checkpointAt)) return;
      if (Date.now() < checkpointAt) return;

      const reminderWindow = Math.floor((Date.now() - checkpointAt) / (15 * 60 * 1000));
      const alertKey = `${nextHeartbeatAtIso}:${Math.max(0, reminderWindow)}`;
      if (lastCheckpointAlertKey === alertKey) return;

      const overdueMinutes = Math.floor((Date.now() - checkpointAt) / 60000);
      const message =
        overdueMinutes <= 0
          ? "Ya debes volver a marcar checkpoint de turno."
          : `Tienes checkpoint vencido desde hace ${overdueMinutes} min. Marca nuevamente tu checkpoint.`;

      try {
        const notification = new Notification("Control Dragon - Marcaje laboral", {
          body: message,
          icon: "/dragonlogo.jpg",
        });
        notification.onclick = () => window.focus();
      } catch {
        return;
      }

      setLastCheckpointAlertKey(alertKey);
    };

    maybeNotify();
    const timer = window.setInterval(maybeNotify, 60_000);
    return () => window.clearInterval(timer);
  }, [hasOpenShift, lastCheckpointAlertKey, nextHeartbeatAtIso]);

  const countdownLabel = useMemo(
    () => formatCountdown(nextHeartbeatAtIso),
    // Include nowTick to refresh each minute without full re-render trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextHeartbeatAtIso, nowTick],
  );

  async function captureGeo() {
    setGeoMessage(null);
    if (!navigator.geolocation) {
      setGeoMessage("Este dispositivo no soporta geolocalizacion.");
      return;
    }
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(String(position.coords.latitude));
          setLongitude(String(position.coords.longitude));
          setGeoMessage("Ubicacion capturada correctamente.");
          resolve();
        },
        (error) => {
          setGeoMessage(`No se pudo capturar geolocalizacion: ${error.message}`);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        },
      );
    });
  }

  async function handleShiftSubmit(
    event: FormEvent<HTMLFormElement>,
    dispatch: (payload: FormData) => void,
    onError: (message: string | null) => void,
  ) {
    event.preventDefault();
    onError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const selfie = formData.get("selfie");
    if (!(selfie instanceof File) || selfie.size <= 0) {
      onError("Debes adjuntar una selfie valida.");
      return;
    }

    try {
      const optimizedSelfie = await optimizeImageForUpload(selfie);
      formData.set("selfie", optimizedSelfie);
      dispatch(formData);
    } catch (error) {
      onError(error instanceof Error ? error.message : "No se pudo procesar la selfie.");
    }
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <p className="font-semibold text-slate-900">Estado de turno</p>
        <p className="text-slate-700">
          {hasOpenShift ? "Turno activo" : "Sin turno activo"}{" "}
          {hasOpenShift ? `| Proximo checkpoint: ${countdownLabel}` : ""}
        </p>
        {heartbeatOverdue ? (
          <p className="mt-1 text-xs font-semibold text-amber-700">
            Tienes checkpoint vencido. Debes marcarlo para seguir operando ingresos/salidas.
          </p>
        ) : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            void captureGeo();
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:w-max"
        >
          Capturar ubicacion actual
        </button>
      </div>
      {geoMessage ? <p className="text-xs text-slate-600">{geoMessage}</p> : null}

      {!hasOpenShift ? (
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            void handleShiftSubmit(event, startAction, setStartSelfieError);
          }}
        >
          <input type="hidden" name="latitude" value={latitude} readOnly />
          <input type="hidden" name="longitude" value={longitude} readOnly />
          <input
            type="file"
            name="selfie"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            required
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
          />
          <button disabled={startPending} className="btn-primary w-full disabled:opacity-60 md:w-max">
            {startPending ? "Iniciando turno..." : "Iniciar turno laboral"}
          </button>
          {startSelfieError ? <p className="text-sm text-red-600">{startSelfieError}</p> : null}
          {startMessage ? <p className="text-sm text-slate-700">{startMessage}</p> : null}
        </form>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              void handleShiftSubmit(event, markAction, setMarkSelfieError);
            }}
          >
            <input type="hidden" name="latitude" value={latitude} readOnly />
            <input type="hidden" name="longitude" value={longitude} readOnly />
            <input
              type="file"
              name="selfie"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              required
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            />
            <button
              disabled={markPending}
              className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {markPending ? "Registrando..." : "Marcar checkpoint de turno"}
            </button>
            {markSelfieError ? <p className="text-sm text-red-600">{markSelfieError}</p> : null}
            {markMessage ? <p className="text-sm text-slate-700">{markMessage}</p> : null}
          </form>

          <form
            className="grid gap-2"
            onSubmit={(event) => {
              void handleShiftSubmit(event, endAction, setEndSelfieError);
            }}
          >
            <input type="hidden" name="latitude" value={latitude} readOnly />
            <input type="hidden" name="longitude" value={longitude} readOnly />
            <input
              type="file"
              name="selfie"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              required
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            />
            <button
              disabled={endPending}
              className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              {endPending ? "Cerrando turno..." : "Finalizar turno laboral"}
            </button>
            {endSelfieError ? <p className="text-sm text-red-600">{endSelfieError}</p> : null}
            {endMessage ? <p className="text-sm text-slate-700">{endMessage}</p> : null}
          </form>
        </div>
      )}
    </div>
  );
}
