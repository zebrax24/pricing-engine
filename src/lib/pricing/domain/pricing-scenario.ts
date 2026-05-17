export type LienPosition = "1st mortgage" | "2nd mortgage";

export type LoanPurpose = "Purchase" | "Rate/Term" | "Cash Out";

export type LoanProduct = "Agency" | "Non-Agency" | "FHA" | "VA";

export type SpecialProduct =
  | "FHA Streamline"
  | "VA IRRRL"
  | "Home Possible"
  | "Home Ready"
  | "N/A";

export type LoanType = "Fixed" | "Adjustable";

export type FixedTerm = "30 Year" | "25 Year" | "20 Year" | "15 Year" | "10 Year";

export type AdjustableTerm =
  | "10 Year Arm"
  | "7 Year Arm"
  | "5 Year Arm"
  | "3 Year Arm"
  | "1 Year Arm";

export type LoanTerm = FixedTerm | AdjustableTerm;

export type EscrowsWaived = "Yes" | "No";

export type MiType = "Borrower Paid MI" | "Lender Paid MI";

export type MiFinanced = "Yes" | "No";

export type VaFundingFee = "Exempt" | "Financed" | "Partial Financed";

export type PricingScenario = {
  lienPosition: LienPosition;
  loanPurpose: LoanPurpose;
  propertyValue: number;
  loanAmount: number;
  secondMortgageBalance: number;
  loanProduct: LoanProduct;
  specialProduct: SpecialProduct;
  loanType: LoanType;
  loanTerm: LoanTerm;
  escrowsWaived: EscrowsWaived;
  ltv: number;
  miType?: MiType;
  miFinanced?: MiFinanced;
  vaFundingFee?: VaFundingFee;
};

export const PROPERTY_VALUE_MIN = 50_000;
export const PROPERTY_VALUE_MAX = 20_000_000;
export const LOAN_AMOUNT_MIN = 40_000;
export const LOAN_AMOUNT_MAX = 5_000_000;
export const LTV_MI_THRESHOLD = 0.8;

export function calculateLtv(loanAmount: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return loanAmount / propertyValue;
}
