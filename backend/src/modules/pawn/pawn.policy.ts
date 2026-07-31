import dayjs from "dayjs";

export const DEFAULT_GRACE_DAYS = 7;
export const DEFAULT_LOAN_DURATION_MONTHS = 12;

export interface LoanCalculationPolicy {
  monthlyInterestRate: number;
  gracePeriodDays: number;
  minimumInterestMonths: number;
}

export const calculateMaturityDate = (pawnedDate: Date, loanDurationMonths: number): Date => {
  return dayjs(pawnedDate).add(loanDurationMonths, "month").toDate();
};

export const calculateAuctionDate = (maturityDate: Date, graceDays: number): Date => {
  return dayjs(maturityDate).add(graceDays, "day").toDate();
};

export const calculateInterestAmount = (
  principal: number,
  monthlyRatePercentage: number,
  months: number
): number => {
  return (principal * monthlyRatePercentage * months) / 100;
};

export function calculateAccruedInterest(
  principal: number,
  startDate: Date,
  currentDate: Date,
  policy: LoanCalculationPolicy
): number {
  const elapsedDays = Math.ceil(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (elapsedDays <= policy.gracePeriodDays) {
    return 0;
  }

  const elapsedMonths = Math.max(
    policy.minimumInterestMonths,
    Math.ceil(elapsedDays / 30)
  );

  return Number(((principal * policy.monthlyInterestRate * elapsedMonths) / 100).toFixed(2));
}