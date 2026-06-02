import Link from "next/link";
import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";
import { BrandLockup } from "@/app/components/brand-lockup";
import { APP_DISPLAY_NAME } from "@/lib/branding";
import { getSupportWhatsappUrl } from "@/lib/email/resend-client";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const supportWhatsappUrl = getSupportWhatsappUrl();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-10">
      <article className="surface-card w-full p-6 md:p-8">
        <div className="mb-5">
          <Link href="/login" className="inline-block">
            <BrandLockup compact />
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">¿Olvidaste tu contraseña?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa tu usuario (el mismo de inicio de sesión). Te enviaremos el enlace al correo de contacto que
          tengas registrado en {APP_DISPLAY_NAME}.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm supportWhatsappUrl={supportWhatsappUrl} />
        </div>
      </article>
    </main>
  );
}
