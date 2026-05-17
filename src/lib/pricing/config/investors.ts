/**
 * Registered investor slugs. Each slug must have:
 * - data/rate-sheets/<slug>/incoming/
 * - src/lib/pricing/parsers/investors/<slug>/parser.ts
 */

export const INVESTOR_SLUGS = [] as const;

export type InvestorSlug = (typeof INVESTOR_SLUGS)[number];
