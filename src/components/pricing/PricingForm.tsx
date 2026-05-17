"use client";

import { useMemo, useState } from "react";

import type { LoanTerm, PricingScenario } from "@/lib/pricing/domain";
import {
  calculateLtv,
  LOAN_AMOUNT_MAX,
  LOAN_AMOUNT_MIN,
  LTV_MI_THRESHOLD,
  PROPERTY_VALUE_MAX,
  PROPERTY_VALUE_MIN,
} from "@/lib/pricing/domain";

import {
  ADJUSTABLE_TERMS,
  ESCROWS_WAIVED_OPTIONS,
  FIXED_TERMS,
  LIEN_POSITIONS,
  LOAN_PRODUCTS,
  LOAN_PURPOSES,
  LOAN_TYPES,
  MI_FINANCED_OPTIONS,
  MI_TYPE_OPTIONS,
  SPECIAL_PRODUCTS,
  VA_FUNDING_FEE_OPTIONS,
} from "./pricing-form-options";

type FormState = {
  lienPosition: string;
  loanPurpose: string;
  propertyValue: string;
  loanAmount: string;
  secondMortgageBalance: string;
  loanProduct: string;
  specialProduct: string;
  loanType: string;
  loanTerm: string;
  escrowsWaived: string;
  miType: string;
  miFinanced: string;
  vaFundingFee: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  lienPosition: "1st mortgage",
  loanPurpose: "Purchase",
  propertyValue: "",
  loanAmount: "",
  secondMortgageBalance: "0",
  loanProduct: "Agency",
  specialProduct: "N/A",
  loanType: "Fixed",
  loanTerm: "30 Year",
  escrowsWaived: "No",
  miType: "Borrower Paid MI",
  miFinanced: "No",
  vaFundingFee: "Financed",
};

function parseAmount(value: string): number | null {
  const trimmed = value.replace(/,/g, "").trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      ) : null}
    </label>
  );
}

const selectClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";

type PricingFormProps = {
  onSubmit?: (scenario: PricingScenario) => void;
};

export function PricingForm({ onSubmit }: PricingFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const propertyValue = parseAmount(form.propertyValue);
  const loanAmount = parseAmount(form.loanAmount);
  const ltv = useMemo(() => {
    if (propertyValue === null || loanAmount === null) return null;
    return calculateLtv(loanAmount, propertyValue);
  }, [propertyValue, loanAmount]);

  const showMiType = ltv !== null && ltv > LTV_MI_THRESHOLD;
  const showMiFinanced = form.loanProduct === "FHA";
  const showVaFundingFee = form.loanProduct === "VA";
  const termOptions = form.loanType === "Adjustable" ? ADJUSTABLE_TERMS : FIXED_TERMS;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "loanType") {
        const options: string[] =
          value === "Adjustable" ? [...ADJUSTABLE_TERMS] : [...FIXED_TERMS];
        if (!options.includes(next.loanTerm)) {
          next.loanTerm = options[0] ?? "";
        }
      }

      return next;
    });

    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!form.lienPosition) next.lienPosition = "Select a lien position.";
    if (!form.loanPurpose) next.loanPurpose = "Select a loan purpose.";

    if (propertyValue === null) {
      next.propertyValue = "Enter property / appraised value.";
    } else if (
      propertyValue < PROPERTY_VALUE_MIN ||
      propertyValue > PROPERTY_VALUE_MAX
    ) {
      next.propertyValue = `Value must be between $${PROPERTY_VALUE_MIN.toLocaleString()} and $${PROPERTY_VALUE_MAX.toLocaleString()}.`;
    }

    if (loanAmount === null) {
      next.loanAmount = "Enter loan amount.";
    } else if (loanAmount < LOAN_AMOUNT_MIN || loanAmount > LOAN_AMOUNT_MAX) {
      next.loanAmount = `Loan amount must be between $${LOAN_AMOUNT_MIN.toLocaleString()} and $${LOAN_AMOUNT_MAX.toLocaleString()}.`;
    }

    const secondBalance = parseAmount(form.secondMortgageBalance);
    if (secondBalance === null || secondBalance < 0) {
      next.secondMortgageBalance = "Enter a valid 2nd mortgage balance (0 or more).";
    }

    if (!form.loanProduct) next.loanProduct = "Select a loan product.";
    if (!form.specialProduct) next.specialProduct = "Select a special product.";
    if (!form.loanType) next.loanType = "Select a loan type.";
    if (!form.loanTerm) next.loanTerm = "Select a loan term.";
    if (!form.escrowsWaived) next.escrowsWaived = "Select escrows waived.";

    if (showMiType && !form.miType) {
      next.miType = "Select MI type.";
    }

    if (showMiFinanced && !form.miFinanced) {
      next.miFinanced = "Select MI financed.";
    }

    if (showVaFundingFee && !form.vaFundingFee) {
      next.vaFundingFee = "Select VA funding fee.";
    }

    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const scenario: PricingScenario = {
      lienPosition: form.lienPosition as PricingScenario["lienPosition"],
      loanPurpose: form.loanPurpose as PricingScenario["loanPurpose"],
      propertyValue: propertyValue!,
      loanAmount: loanAmount!,
      secondMortgageBalance: parseAmount(form.secondMortgageBalance) ?? 0,
      loanProduct: form.loanProduct as PricingScenario["loanProduct"],
      specialProduct: form.specialProduct as PricingScenario["specialProduct"],
      loanType: form.loanType as PricingScenario["loanType"],
      loanTerm: form.loanTerm as LoanTerm,
      escrowsWaived: form.escrowsWaived as PricingScenario["escrowsWaived"],
      ltv: ltv!,
      ...(showMiType && {
        miType: form.miType as PricingScenario["miType"],
      }),
      ...(showMiFinanced && {
        miFinanced: form.miFinanced as PricingScenario["miFinanced"],
      }),
      ...(showVaFundingFee && {
        vaFundingFee: form.vaFundingFee as PricingScenario["vaFundingFee"],
      }),
    };

    onSubmit?.(scenario);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      noValidate
    >
      <Field label="Lien Position" error={errors.lienPosition}>
        <select
          className={selectClassName}
          value={form.lienPosition}
          onChange={(e) => updateField("lienPosition", e.target.value)}
        >
          {LIEN_POSITIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Loan Purpose" error={errors.loanPurpose}>
        <select
          className={selectClassName}
          value={form.loanPurpose}
          onChange={(e) => updateField("loanPurpose", e.target.value)}
        >
          {LOAN_PURPOSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Property / Appraised Value" error={errors.propertyValue}>
        <input
          type="number"
          className={inputClassName}
          min={PROPERTY_VALUE_MIN}
          max={PROPERTY_VALUE_MAX}
          step={1000}
          placeholder="50000 – 20000000"
          value={form.propertyValue}
          onChange={(e) => updateField("propertyValue", e.target.value)}
        />
      </Field>

      <Field label="Loan Amount" error={errors.loanAmount}>
        <input
          type="number"
          className={inputClassName}
          min={LOAN_AMOUNT_MIN}
          max={LOAN_AMOUNT_MAX}
          step={1000}
          placeholder="40000 – 5000000"
          value={form.loanAmount}
          onChange={(e) => updateField("loanAmount", e.target.value)}
        />
      </Field>

      <Field label="2nd Mortgage Balance" error={errors.secondMortgageBalance}>
        <input
          type="number"
          className={inputClassName}
          min={0}
          step={1000}
          value={form.secondMortgageBalance}
          onChange={(e) => updateField("secondMortgageBalance", e.target.value)}
        />
      </Field>

      <Field label="Loan Product" error={errors.loanProduct}>
        <select
          className={selectClassName}
          value={form.loanProduct}
          onChange={(e) => updateField("loanProduct", e.target.value)}
        >
          {LOAN_PRODUCTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Special Product" error={errors.specialProduct}>
        <select
          className={selectClassName}
          value={form.specialProduct}
          onChange={(e) => updateField("specialProduct", e.target.value)}
        >
          {SPECIAL_PRODUCTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Loan Type" error={errors.loanType}>
        <select
          className={selectClassName}
          value={form.loanType}
          onChange={(e) => updateField("loanType", e.target.value)}
        >
          {LOAN_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={form.loanType === "Adjustable" ? "ARM Term" : "Fixed Term"}
        error={errors.loanTerm}
      >
        <select
          className={selectClassName}
          value={form.loanTerm}
          onChange={(e) => updateField("loanTerm", e.target.value)}
        >
          {termOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Escrows Waived" error={errors.escrowsWaived}>
        <select
          className={selectClassName}
          value={form.escrowsWaived}
          onChange={(e) => updateField("escrowsWaived", e.target.value)}
        >
          {ESCROWS_WAIVED_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {ltv !== null ? (
        <p className="text-xs text-zinc-500">
          Loan to Value (LTV): {formatPercent(ltv)}
        </p>
      ) : null}

      {showMiType ? (
        <Field label="MI Type" error={errors.miType}>
          <select
            className={selectClassName}
            value={form.miType}
            onChange={(e) => updateField("miType", e.target.value)}
          >
            {MI_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {showMiFinanced ? (
        <Field label="MI Financed" error={errors.miFinanced}>
          <select
            className={selectClassName}
            value={form.miFinanced}
            onChange={(e) => updateField("miFinanced", e.target.value)}
          >
            {MI_FINANCED_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {showVaFundingFee ? (
        <Field label="VA Funding Fee" error={errors.vaFundingFee}>
          <select
            className={selectClassName}
            value={form.vaFundingFee}
            onChange={(e) => updateField("vaFundingFee", e.target.value)}
          >
            {VA_FUNDING_FEE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <button
        type="submit"
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Get pricing
      </button>
    </form>
  );
}
