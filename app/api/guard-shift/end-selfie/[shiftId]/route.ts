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
      endSelfieData: true,
      endSelfieMimeType: true,
    },
  });
  if (!shift?.endSelfieData) {
    return NextResponse.json({ error: "Evidencia no encontrada." }, { status: 404 });
  }

  return new Response(shift.endSelfieData, {
    headers: {
      "Content-Type": shift.endSelfieMimeType || "application/octet-stream",
      "Cache-Control": "private, max-age=60",
    },
  });
}
