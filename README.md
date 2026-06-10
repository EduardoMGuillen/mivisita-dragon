# MiVisita - Dragon Seguridad

Plataforma white label de control de acceso residencial. **Dragon Seguridad** opera el servicio en campo; el motor tecnologico es **MiVisita** ([mivisita.app](https://mivisita.app)), desarrollado por **Nexus Global**.

- Produccion: [mivisitadragon.xyz](https://mivisitadragon.xyz)
- Repositorio: [github.com/EduardoMGuillen/mivisita-dragon](https://github.com/EduardoMGuillen/mivisita-dragon)

---

## Como funciona el sistema (vision general)

La app conecta cuatro roles dentro de un **residencial** (conjunto habitacional). Cada usuario pertenece a una residencial (excepto super admin). Los datos estan aislados por `residentialId`: un guardia solo escanea QRs de su residencial, un residente solo ve sus invitaciones, etc.

Flujo tipico de una visita:

1. El **residente** crea un QR con vigencia (un solo uso, 1 dia, 3 dias o infinito) y lo comparte por WhatsApp o PDF.
2. El **guardia** escanea el QR en la posta, captura foto del ID (y placa si viene en vehiculo).
3. El sistema valida vigencia, usos y residencial; registra el ingreso y envia **push** al residente.
4. Al salir, el guardia escanea de nuevo en modo salida (o marca salida manual en flujos Posta).
5. **Admin** y **super admin** consultan historial, exportan PDFs y generan reportes.

Adicionalmente existen **reservas de zonas comunes**, **comunicados push**, **delivery en posta** y **entrada manual por llamada** (flujo Posta).

---

## Roles y paneles

### Residente (`/resident`)

**Crear invitacion (QR)**

- Tipos de vigencia configurables por residencial: `SINGLE_USE`, `ONE_DAY`, `THREE_DAYS`, `INFINITE`.
- Opciones segun flags del residencial: fecha/hora programada, tipo de vehiculo, acompanantes, QR de delivery.
- El codigo QR usa prefijo `MP:` + codigo unico en base de datos.
- Puede compartir por WhatsApp, descargar PDF o imagen PNG.

**Panel del residente (orden de secciones)**

1. Crear anuncio de visita
2. QRs activos (vigentes, no revocados, con usos disponibles)
3. Visita en curso (Posta) — entradas creadas por guardia con ingreso ya marcado y salida pendiente
4. QRs expirados (colapsado por defecto)
5. Reservar zona comun + listado de reservas propias (ver, editar, cancelar)

**Otras funciones**

- Anuncios del admin, perfil, soporte (WhatsApp), sugerencias, ajustes (idioma ES/EN en UI).
- Notificaciones push al llegar visita o delivery. **No** se envia push cuando se registra salida.

**Consulta de QRs**

- Activos y expirados se cargan en consultas separadas para evitar que QRs viejos oculten los nuevos.
- QRs revocados (`isRevoked`) se muestran como expirados aunque `validUntil` siga vigente.

---

### Guardia (`/guard`)

**Escanear QR**

- Modo **entrada**: valida codigo, abre modal para foto de ID (y placa si `hasVehicle`). La imagen se comprime en el cliente (~400 KB) antes de enviar.
- Modo **salida**: registra `exitedAt` en el ultimo ingreso valido del QR.
- Endpoint: `/api/guard/scan` y `/api/guard/scan-with-id`.

**Entrada manual por llamada (Posta)**

- Si el residente anuncia por telefono, el guardia selecciona residente, nombre de visita y evidencias.
- Se crea un QR de un solo uso (`SINGLE_USE`, misma ventana que el residente: hasta 3 dias, 1 uso) con descripcion especial `GUARD_GENERATED:`.
- La **entrada queda registrada al guardar**; el residente ve el QR con etiqueta Posta y recibe push de entrada.
- Botones **Tomar o elegir foto** en lugar del input nativo "Choose file".

**Salidas Posta**

- Solo el guardia que registro la entrada puede marcar salida manual.
- **Auto-cierre**: si pasan **48 horas** sin salida manual, el sistema la marca al abrir el panel de guardia o residente (nota: "Salida automatica por sistema..."). No hay cron horario; no se notifica al residente por salida.

**Listados en panel Posta**

- Salidas pendientes (propias): hasta 15.
- Entradas recientes: ultimas **8** de los ultimos **3 dias**.

**Marcaje laboral (turno)**

- Modulo de turno, checkpoints cada 2h y selfie con geolocalizacion.
- **Desactivado por defecto** (`GUARD_SHIFT_ENFORCEMENT_ENABLED = false` en `lib/guard-shift.ts`). Super admin ve el estado en `/super-admin/guard-attendance`.
- Cuando este activo, el guardia debe iniciar turno y marcar checkpoints para escanear o registrar entradas.

**Otros**

- Pedidos en posta (delivery) si la residencial lo habilita.
- Reservas de zonas del dia para control en caseta.
- Anuncios pendientes (colapsado): aceptar llegada manual con evidencia ID/placa.

---

### Admin residencial (`/residential-admin`)

- **Usuarios**: alta de residentes y guardias, OTP de un solo uso, credenciales.
- **Zonas y reservas**: crear zonas, bloqueos, politicas de horas; ver/cancelar reservas.
- **Comunicados**: push masivo o a residentes seleccionados.
- **QR administracion**: QRs de uso administrativo con compartir PDF (usa `useOptionalResidentT` para no requerir contexto i18n del residente).
- **Registros**: filtros por mes, exporte PDF por registro, reporte mensual.
- **Configuracion**: flags de QR (vehiculo, delivery, posta), telefono soporte, notificaciones.
- **Sugerencias** de residentes.

---

### Super Admin (`/super-admin`)

- Alta de residenciales y admins iniciales.
- Cotizaciones y contratos PDF (branding MiVisita + Dragon).
- Facturas PDF.
- Registros globales y estadisticas.
- Respaldos: reportes ZIP y backup completo de BD (JSON + evidencia base64).
- Banner global del sitio.
- Suspension temporal de residencial.
- Vista de asistencia de guardias y estado del marcaje laboral.

---

## Modelo de datos (resumen)

| Entidad | Proposito |
|---------|-----------|
| `Residential` | Conjunto; flags de funciones, soporte, suspension, geocerca de caseta |
| `User` | Residente, guardia, admin o super admin |
| `QrCode` | Invitacion: codigo, vigencia, usos, vehiculo, categoria VISIT/DELIVERY |
| `QrScan` | Evento de ingreso/salida + evidencia ID/placa en bytes |
| `Zone` / `ZoneReservation` / `ZoneBlock` | Zonas comunes y calendario |
| `PushSubscription` | Suscripciones web push por usuario |
| `GuardShift` / `GuardShiftMark` | Turnos y checkpoints (si marcaje activo) |

---

## Evidencia fotografica

| Tipo | Objetivo al guardar | Tope servidor |
|------|---------------------|---------------|
| ID / placa | ~400 KB (JPEG, max 1280px) | 512 KB |
| Selfie turno guardia | ~320 KB (max 960px) | 512 KB |

- Compresion en cliente (`lib/optimize-image-upload.ts`) antes de server actions o API.
- Validacion en servidor (`lib/id-photo-storage.ts`).
- **Retencion**: cron diario purga bytes de evidencia a los **60 dias**; el registro del evento permanece.

---

## Autenticacion y seguridad

- Sesion con cookie firmada (`AUTH_SECRET`).
- OTP de un solo uso para residentes (cifrado con `AUTH_SECRET`).
- Recuperacion de contraseña por email (Resend).
- Middleware protege rutas por rol.
- Residencial suspendida: usuarios de esa residencial no operan (excepto super admin).

---

## Notificaciones push (VAPID)

- Residente: llegada de visita (escaneo o Posta), delivery en posta, comunicados, cambios en reservas.
- **No** se notifica salida de visita (manual ni automatica).
- Requiere `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`.

---

## PWA y SEO

- `manifest.webmanifest`, instalacion desde `/login?install=1`.
- Pagina offline `/offline`.
- `sitemap.xml`, `robots.txt`, metadata y Open Graph con `NEXT_PUBLIC_APP_URL` (debe incluir `https://`).

---

## Cron (Vercel)

| Ruta | Horario | Funcion |
|------|---------|---------|
| `/api/internal/purge-id-evidence` | 03:00 UTC | Borra bytes de evidencia > 60 dias |
| `/api/internal/purge-suspended-users` | 03:30 UTC | Purga usuarios suspendidos (si flag activo) |

Requiere header `Authorization: Bearer {CRON_SECRET}`.

---

## Stack tecnico

- Next.js 15 (App Router), React, TypeScript
- Prisma ORM + PostgreSQL (Supabase)
- Web Push, Resend (email), jsPDF, JSZip
- Despliegue: Vercel

---

## Variables de entorno

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=https://mivisitadragon.xyz

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CONTACT_EMAIL=

RESEND_API_KEY=
CRON_SECRET=
```

---

## Migraciones

### Prisma (recomendado)

```bash
npm run prisma:generate
npm run prisma:push
```

### SQL manual (Supabase)

Ejecutar en orden las carpetas en `prisma/migrations/` por fecha.

Para seed inicial con super admin, usar `prisma/supabase-full-setup.sql` **solo en local** (esta en `.gitignore` por credenciales).

---

## Desarrollo local

```bash
npm install
npm run prisma:generate
npm run dev
```

Abrir `http://localhost:3000`.

```bash
npm run lint
npm run build
```

---

## Branding y legal

- Nombre visible: **MiVisita - Dragon Seguridad**
- Motor: MiVisita.app · Operacion: Dragon Seguridad · Desarrollo: Nexus Global
- Propiedad intelectual del software: Nexus Global (ver Terminos y Politicas de Privacidad)

---

## Operacion recomendada

- Backup PDF y ZIP de BD antes de cambios mayores.
- No commitear `.env` ni `prisma/supabase-full-setup.sql`.
- Revisar peso de backups si hay alto volumen de evidencia.
- Para activar marcaje obligatorio de guardias: `GUARD_SHIFT_ENFORCEMENT_ENABLED = true` en `lib/guard-shift.ts` y redeploy.
