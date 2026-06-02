import Link from "next/link";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";
import { BrandLockup } from "@/app/components/brand-lockup";

export const dynamic = "force-dynamic";

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = getSingleParam(params.token).trim();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-10">
      <article className="surface-card w-full p-6 md:p-8">
        <div className="mb-5">
          <Link href="/login" className="inline-block">
            <BrandLockup compact />
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Restablecer contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">Elige una contraseña nueva para tu cuenta.</p>
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      </article>
    </main>
  );
}
