import type { UnifiedQuote } from "@/lib/pricing/domain";

type QuotesTableProps = {
  quotes: UnifiedQuote[];
};

/**
 * Unified comparison: investor, program, rate, price, profit.
 */
export function QuotesTable({ quotes }: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No quotes yet. Results will appear here after ingest and search logic
        are implemented.
      </section>
    );
  }

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-3 font-medium">Investor</th>
            <th className="px-4 py-3 font-medium">Program</th>
            <th className="px-4 py-3 font-medium">Rate</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Profit</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote, index) => (
            <tr
              key={`${quote.investor}-${quote.program}-${index}`}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <td className="px-4 py-3">{quote.investor}</td>
              <td className="px-4 py-3">{quote.program}</td>
              <td className="px-4 py-3 font-mono">{quote.rate}</td>
              <td className="px-4 py-3 font-mono">{quote.price}</td>
              <td className="px-4 py-3 font-mono">{quote.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
