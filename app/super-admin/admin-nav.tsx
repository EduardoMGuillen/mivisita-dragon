"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/super-admin/residenciales", label: "Residenciales y admins" },
  { href: "/super-admin/contratos", label: "Cotizaciones y contratos" },
  { href: "/super-admin/respaldos", label: "Respaldos" },
  { href: "/super-admin/registros", label: "Registro y reportes" },
  { href: "/super-admin/estadisticas", label: "Estadisticas" },
  { href: "/super-admin/guard-attendance", label: "Asistencia guardias" },
];

export function SuperAdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const selectValue = NAV_ITEMS.some((item) => item.href === pathname)
    ? pathname
    : "/super-admin/residenciales";

  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Secciones</p>
      <label className="sr-only" htmlFor="super-admin-nav-select">
        Navegacion rapida
      </label>
      <select
        id="super-admin-nav-select"
        className="field-base md:hidden"
        value={selectValue}
        onChange={(event) => router.push(event.target.value)}
      >
        {NAV_ITEMS.map((item) => (
          <option key={item.href} value={item.href}>
            {item.label}
          </option>
        ))}
      </select>
      <nav className="hidden flex-wrap gap-2 md:flex" aria-label="Super admin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
