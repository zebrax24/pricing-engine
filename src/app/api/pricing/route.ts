import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    quotes: "POST /api/pricing/quotes with PricingScenario body",
  });
}
