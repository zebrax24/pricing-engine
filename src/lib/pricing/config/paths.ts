import path from "node:path";

const PROJECT_ROOT = process.cwd();

/** Root directory for daily investor rate sheet drops. */
export const RATE_SHEETS_ROOT = path.join(PROJECT_ROOT, "data", "rate-sheets");

export function rateSheetIncomingDir(investorSlug: string): string {
  return path.join(RATE_SHEETS_ROOT, investorSlug, "incoming");
}

export function rateSheetArchiveDir(investorSlug: string): string {
  return path.join(RATE_SHEETS_ROOT, investorSlug, "archive");
}
