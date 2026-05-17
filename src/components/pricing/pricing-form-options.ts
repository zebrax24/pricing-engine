import type {
  AdjustableTerm,
  EscrowsWaived,
  FixedTerm,
  LienPosition,
  LoanProduct,
  LoanPurpose,
  LoanType,
  MiFinanced,
  MiType,
  SpecialProduct,
  VaFundingFee,
} from "@/lib/pricing/domain";

export const LIEN_POSITIONS: LienPosition[] = ["1st mortgage", "2nd mortgage"];

export const LOAN_PURPOSES: LoanPurpose[] = [
  "Purchase",
  "Rate/Term",
  "Cash Out",
];

export const LOAN_PRODUCTS: LoanProduct[] = [
  "Agency",
  "Non-Agency",
  "FHA",
  "VA",
];

export const SPECIAL_PRODUCTS: SpecialProduct[] = [
  "FHA Streamline",
  "VA IRRRL",
  "Home Possible",
  "Home Ready",
  "N/A",
];

export const LOAN_TYPES: LoanType[] = ["Fixed", "Adjustable"];

export const FIXED_TERMS: FixedTerm[] = [
  "30 Year",
  "25 Year",
  "20 Year",
  "15 Year",
  "10 Year",
];

export const ADJUSTABLE_TERMS: AdjustableTerm[] = [
  "10 Year Arm",
  "7 Year Arm",
  "5 Year Arm",
  "3 Year Arm",
  "1 Year Arm",
];

export const ESCROWS_WAIVED_OPTIONS: EscrowsWaived[] = ["Yes", "No"];

export const MI_TYPE_OPTIONS: MiType[] = [
  "Borrower Paid MI",
  "Lender Paid MI",
];

export const MI_FINANCED_OPTIONS: MiFinanced[] = ["Yes", "No"];

export const VA_FUNDING_FEE_OPTIONS: VaFundingFee[] = [
  "Exempt",
  "Financed",
  "Partial Financed",
];
