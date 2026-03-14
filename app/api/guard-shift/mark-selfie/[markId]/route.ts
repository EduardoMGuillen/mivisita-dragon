import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ markId: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { markId } = await context.params;
  const mark = await prisma.guardShiftMark.findUnique({
    where: { id: markId },
    select: {
      selfieData: true,
      selfieMimeType: true,
    },
  });
  if (!mark?.selfieData) {
    return NextResponse.json({ error: "Evidencia no encontrada." }, { status: 404 });
  }

  return new Response(mark.selfieData, {
    headers: {
      "Content-Type": mark.selfieMimeType || "application/octet-stream",
      "Cache-Control": "private, max-age=60",
    },
  });
}
