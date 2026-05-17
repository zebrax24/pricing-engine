import { PricingForm } from "@/components/pricing/PricingForm";
import { QuotesTable } from "@/components/pricing/QuotesTable";

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Pricing
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enter loan scenario inputs to compare all investors, programs, rates,
          prices, and profit.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
        <PricingForm />
        <QuotesTable quotes={[]} />
      </div>
    </div>
  );
}
