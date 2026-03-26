import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function fourMonthsAgo(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 4);
  return cutoff;
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado." }, { status: 500 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const cutoff = fourMonthsAgo();

  const purgeResult = await prisma.user.deleteMany({
    where: {
      role: "RESIDENT",
      isSuspended: true,
      suspendedAt: { not: null, lt: cutoff },
      residential: { is: { enableAutoDeleteSuspendedResidents: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    deleted: purgeResult.count,
    cutoffIso: cutoff.toISOString(),
  });
}

