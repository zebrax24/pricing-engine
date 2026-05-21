"use client";

import { useMemo, useState } from "react";

import type { LoanTerm, PricingScenario } from "@/lib/pricing/domain";
import {
  calculateLtv,
  FICO_MAX,
  FICO_MIN,
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
  PROPERTY_STATES,
  PROPERTY_TYPES,
  PROPERTY_USES,
  SPECIAL_PRODUCTS,
  VA_FUNDING_FEE_OPTIONS,
  YES_NO_OPTIONS,
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
  propertyState: string;
  zipCode: string;
  ficoScore: string;
  propertyType: string;
  propertyUse: string;
  latePayments: string;
  late30Count: string;
  late60Count: string;
  late90Count: string;
  late120Count: string;
  bankruptcyLast3Years: string;
  noticeOfDefault: string;
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
  propertyState: "CA",
  zipCode: "",
  ficoScore: "",
  propertyType: "Single Family Residence",
  propertyUse: "Primary",
  latePayments: "No",
  late30Count: "0",
  late60Count: "0",
  late90Count: "0",
  late120Count: "0",
  bankruptcyLast3Years: "No",
  noticeOfDefault: "No",
};

function parseAmount(value: string): number | null {
  const trimmed = value.replace(/,/g, "").trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCount(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
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

  const showMiType =
    form.loanProduct !== "VA" && ltv !== null && ltv > LTV_MI_THRESHOLD;
  const showMiFinanced = form.loanProduct === "FHA";
  const showVaFundingFee = form.loanProduct === "VA";
  const showLatePaymentCounts = form.latePayments === "Yes";
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

    if (!form.propertyState) {
      next.propertyState = "Select property state.";
    }

    const zip = form.zipCode.trim();
    if (!/^\d{5}$/.test(zip)) {
      next.zipCode = "Enter a valid 5-digit ZIP code.";
    }

    const fico = parseAmount(form.ficoScore);
    if (fico === null || !Number.isInteger(fico)) {
      next.ficoScore = "Enter a valid FICO score.";
    } else if (fico < FICO_MIN || fico > FICO_MAX) {
      next.ficoScore = `FICO score must be between ${FICO_MIN} and ${FICO_MAX}.`;
    }

    if (!form.propertyType) next.propertyType = "Select property type.";
    if (!form.propertyUse) next.propertyUse = "Select property use.";
    if (!form.latePayments) next.latePayments = "Select late payments.";

    if (showLatePaymentCounts) {
      const late30 = parseCount(form.late30Count);
      const late60 = parseCount(form.late60Count);
      const late90 = parseCount(form.late90Count);
      const late120 = parseCount(form.late120Count);

      if (late30 === null) next.late30Count = "Enter a valid count.";
      if (late60 === null) next.late60Count = "Enter a valid count.";
      if (late90 === null) next.late90Count = "Enter a valid count.";
      if (late120 === null) next.late120Count = "Enter a valid count.";

      if (
        late30 !== null &&
        late60 !== null &&
        late90 !== null &&
        late120 !== null &&
        late30 + late60 + late90 + late120 === 0
      ) {
        next.late30Count = "Enter at least one late payment count.";
      }
    }

    if (!form.bankruptcyLast3Years) {
      next.bankruptcyLast3Years = "Select bankruptcy.";
    }
    if (!form.noticeOfDefault) {
      next.noticeOfDefault = "Select notice of default.";
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
      propertyState: form.propertyState as PricingScenario["propertyState"],
      zipCode: form.zipCode.trim(),
      ficoScore: parseAmount(form.ficoScore)!,
      propertyType: form.propertyType as PricingScenario["propertyType"],
      propertyUse: form.propertyUse as PricingScenario["propertyUse"],
      latePayments: form.latePayments as PricingScenario["latePayments"],
      ...(showLatePaymentCounts && {
        latePaymentCounts: {
          days30: parseCount(form.late30Count)!,
          days60: parseCount(form.late60Count)!,
          days90: parseCount(form.late90Count)!,
          days120: parseCount(form.late120Count)!,
        },
      }),
      bankruptcyLast3Years:
        form.bankruptcyLast3Years as PricingScenario["bankruptcyLast3Years"],
      noticeOfDefault:
        form.noticeOfDefault as PricingScenario["noticeOfDefault"],
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

      <Field label="Property State" error={errors.propertyState}>
        <select
          className={selectClassName}
          value={form.propertyState}
          onChange={(e) => updateField("propertyState", e.target.value)}
        >
          {PROPERTY_STATES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="ZIP Code" error={errors.zipCode}>
        <input
          type="text"
          inputMode="numeric"
          className={inputClassName}
          maxLength={5}
          placeholder="12345"
          value={form.zipCode}
          onChange={(e) =>
            updateField("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))
          }
        />
      </Field>

      <Field label="FICO Score" error={errors.ficoScore}>
        <input
          type="number"
          className={inputClassName}
          min={FICO_MIN}
          max={FICO_MAX}
          step={1}
          placeholder={`${FICO_MIN} – ${FICO_MAX}`}
          value={form.ficoScore}
          onChange={(e) => updateField("ficoScore", e.target.value)}
        />
      </Field>

      <Field label="Property Type" error={errors.propertyType}>
        <select
          className={selectClassName}
          value={form.propertyType}
          onChange={(e) => updateField("propertyType", e.target.value)}
        >
          {PROPERTY_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Property Use" error={errors.propertyUse}>
        <select
          className={selectClassName}
          value={form.propertyUse}
          onChange={(e) => updateField("propertyUse", e.target.value)}
        >
          {PROPERTY_USES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Late Payments" error={errors.latePayments}>
        <select
          className={selectClassName}
          value={form.latePayments}
          onChange={(e) => updateField("latePayments", e.target.value)}
        >
          {YES_NO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      {showLatePaymentCounts ? (
        <fieldset className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <legend className="px-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Late payment counts
          </legend>
          <Field label="30-day" error={errors.late30Count}>
            <input
              type="number"
              className={inputClassName}
              min={0}
              step={1}
              value={form.late30Count}
              onChange={(e) => updateField("late30Count", e.target.value)}
            />
          </Field>
          <Field label="60-day" error={errors.late60Count}>
            <input
              type="number"
              className={inputClassName}
              min={0}
              step={1}
              value={form.late60Count}
              onChange={(e) => updateField("late60Count", e.target.value)}
            />
          </Field>
          <Field label="90-day" error={errors.late90Count}>
            <input
              type="number"
              className={inputClassName}
              min={0}
              step={1}
              value={form.late90Count}
              onChange={(e) => updateField("late90Count", e.target.value)}
            />
          </Field>
          <Field label="120-day" error={errors.late120Count}>
            <input
              type="number"
              className={inputClassName}
              min={0}
              step={1}
              value={form.late120Count}
              onChange={(e) => updateField("late120Count", e.target.value)}
            />
          </Field>
        </fieldset>
      ) : null}

      <Field
        label="Bankruptcy in Last 3 Years"
        error={errors.bankruptcyLast3Years}
      >
        <select
          className={selectClassName}
          value={form.bankruptcyLast3Years}
          onChange={(e) => updateField("bankruptcyLast3Years", e.target.value)}
        >
          {YES_NO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Notice of Default" error={errors.noticeOfDefault}>
        <select
          className={selectClassName}
          value={form.noticeOfDefault}
          onChange={(e) => updateField("noticeOfDefault", e.target.value)}
        >
          {YES_NO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Get pricing
      </button>
    </form>
  );
}
