"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitLandingLeadAction, type LandingLeadState } from "@/app/landing/actions";
import { APP_DISPLAY_NAME } from "@/lib/branding";

const FIELD_ERRORS: Record<string, string> = {
  name_short: "Indica tu nombre (minimo 2 caracteres).",
  email_invalid: "Correo electronico no valido.",
  message_short: "El mensaje debe tener al menos 15 caracteres.",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
      {pending ? "Enviando…" : "Solicitar informacion"}
    </button>
  );
}

export function LandingLeadForm() {
  const [state, formAction] = useActionState(submitLandingLeadAction, {
    status: "idle",
  } satisfies LandingLeadState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  function fieldError(name: string) {
    if (state.status !== "validation") return null;
    const code = state.fieldErrors[name];
    if (!code) return null;
    return <p className="mt-1 text-xs font-medium text-red-600">{FIELD_ERRORS[code] ?? "Dato invalido."}</p>;
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <input
        type="text"
        name="trap"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
      />
      <div>
        <label htmlFor="lead-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Nombre
        </label>
        <input id="lead-name" name="name" required className="field-base" autoComplete="name" />
        {fieldError("name")}
      </div>
      <div>
        <label htmlFor="lead-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Correo
        </label>
        <input id="lead-email" name="email" type="email" required className="field-base" autoComplete="email" />
        {fieldError("email")}
      </div>
      <div>
        <label htmlFor="lead-phone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Telefono (opcional)
        </label>
        <input id="lead-phone" name="phone" type="tel" className="field-base" autoComplete="tel" />
      </div>
      <div>
        <label
          htmlFor="lead-residential"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Residencial o empresa
        </label>
        <input id="lead-residential" name="residentialHint" className="field-base" placeholder="Ej. Condominio Las Palmas" />
      </div>
      <div>
        <label htmlFor="lead-message" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Mensaje
        </label>
        <textarea
          id="lead-message"
          name="message"
          required
          rows={4}
          className="field-base resize-y"
          placeholder={`Cuentanos como te gustaria usar ${APP_DISPLAY_NAME}…`}
        />
        {fieldError("message")}
      </div>
      {state.status === "success" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Gracias. Recibimos tu solicitud y te contactaremos pronto.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          No pudimos enviar el formulario. Intenta de nuevo o escribe a soporte.
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
