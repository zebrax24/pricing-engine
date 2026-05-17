import { NextResponse } from "next/server";

import { aggregate } from "@/lib/pricing/aggregator";
import type { PricingScenario } from "@/lib/pricing/domain";
import { getLatestRateRows } from "@/lib/pricing/repository";

/** POST scenario inputs → unified investor comparison table. */
export async function POST(request: Request) {
  const scenario = (await request.json()) as PricingScenario;
  const rows = await getLatestRateRows();
  const quotes = aggregate(scenario, rows);

  return NextResponse.json({ quotes });
}
