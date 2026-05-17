import type { RateRow } from "../domain";

/**
 * Loads normalized rate rows (from ingest cache, files, or DB later).
 */
export async function getLatestRateRows(): Promise<RateRow[]> {
  return [];
}
