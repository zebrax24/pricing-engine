import type { RateRow } from "../../../domain";

export type RateSheetParser = {
  investorId: string;
  parse: (filePath: string) => Promise<RateRow[]>;
};

/**
 * Template parser — duplicate this folder per investor.
 * Reads from data/rate-sheets/<slug>/incoming/
 */
export const templateParser: RateSheetParser = {
  investorId: "_template",
  async parse(_filePath: string) {
    return [];
  },
};
