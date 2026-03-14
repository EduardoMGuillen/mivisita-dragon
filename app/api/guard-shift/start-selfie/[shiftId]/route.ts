import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ shiftId: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { shiftId } = await context.params;
  const shift = await prisma.guardShift.findUnique({
    where: { id: shiftId },
    select: {
      startSelfieData: true,
      startSelfieMimeType: true,
    },
  });
  if (!shift?.startSelfieData) {
    return NextResponse.json({ error: "Evidencia no encontrada." }, { status: 404 });
  }

  return new Response(shift.startSelfieData, {
    headers: {
      "Content-Type": shift.startSelfieMimeType || "application/octet-stream",
      "Cache-Control": "private, max-age=60",
    },
  });
}
