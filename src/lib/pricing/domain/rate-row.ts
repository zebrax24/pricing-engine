/**
 * Normalized row from any investor rate sheet (post-parse / pre-aggregation).
 */

export type RateRow = {
  investorId: string;
  investorName: string;
  program: string;
  rate: number;
  price: number;
};
