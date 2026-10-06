import { roundMoney, toMoney, toSignedMoney } from "@/lib/money";
import { inRange } from "@/lib/dates";
import {
  CommissionType,
  DateRange,
  DriveSummary,
  Reservation,
  ReservationFinance,
} from "@/lib/types";

export const MISSING_REASONS = [
  "Customer paid less",
  "Discount",
  "Customer complaint",
  "Partial payment",
  "Driver error",
  "Other",
] as const;

export const EXTRA_REASONS = [
  "Extra service",
  "Tip",
  "Additional passenger",
  "Additional charge",
  "Other",
] as const;

export const CANCEL_REASONS = [
  "Customer cancelled",
  "No show",
  "Driver unavailable",
  "Bad weather",
  "Duplicate booking",
  "Other",
] as const;

export function isCancelledStatus(status: string) {
  return status === "Cancelled" || status === "No Show";
}

export function isOpenStatus(status: string) {
  return status === "New" || status === "Confirmed" || status === "On the way";
}

export function calculateCommissionAmount(
  price: number,
  type: CommissionType,
  rate: number,
  fixedAmount: number,
) {
  const expected = toMoney(price);
  if (type === "percentage") {
    return roundMoney(expected * (toMoney(rate) / 100));
  }
  return toMoney(fixedAmount);
}

export function paymentStatusFromReceived(expected: number, received: number) {
  if (received <= 0) return "Unpaid" as const;
  if (received + 0.009 < expected) return "Partially Paid" as const;
  return "Paid" as const;
}

export function calculateReservationFinance(item: Reservation): ReservationFinance {
  const expectedAmount = toMoney(item.price);
  const cancelled = isCancelledStatus(item.status);
  const cancellationFee = toMoney(item.cancellationFee);
  const adjustmentAmount = toSignedMoney(item.adjustmentAmount);

  if (cancelled) {
    const commission = cancellationFee > 0 ? toMoney(item.cancellationCommission) : 0;
    const amountReceived =
      cancellationFee > 0 ? toMoney(item.amountReceived || cancellationFee) : 0;
    const difference = roundMoney(amountReceived - cancellationFee);
    return {
      expectedAmount,
      commission,
      amountReceived,
      difference,
      missingAmount: difference < 0 ? Math.abs(difference) : 0,
      extraAmount: difference > 0 ? difference : 0,
      remaining: Math.max(0, roundMoney(cancellationFee - amountReceived)),
      netAmount: roundMoney(amountReceived - commission - adjustmentAmount),
      officeNet: roundMoney(amountReceived - commission - adjustmentAmount),
      countsAsCompleted: false,
      countsAsRevenue: cancellationFee > 0,
    };
  }

  const commission = calculateCommissionAmount(
    expectedAmount,
    item.commissionType,
    item.commissionRate,
    item.driverCommission,
  );
  const legacyComplete = item.status === "Completed" && !item.completedAt;
  const amountReceived =
    item.amountReceived > 0
      ? toMoney(item.amountReceived)
      : legacyComplete
        ? expectedAmount
        : toMoney(item.amountReceived);
  const difference = roundMoney(amountReceived - expectedAmount);
  return {
    expectedAmount,
    commission,
    amountReceived,
    difference,
    missingAmount: difference < 0 ? Math.abs(difference) : 0,
    extraAmount: difference > 0 ? difference : 0,
    remaining: Math.max(0, roundMoney(expectedAmount - amountReceived)),
    netAmount: roundMoney(amountReceived - commission - adjustmentAmount),
    officeNet: roundMoney(amountReceived - commission - adjustmentAmount),
    countsAsCompleted: item.status === "Completed",
    countsAsRevenue: item.status === "Completed",
  };
}

export function emptyDriveSummary(): DriveSummary {
  return {
    completedCount: 0,
    cancelledCount: 0,
    expectedRevenue: 0,
    actualReceived: 0,
    missing: 0,
    extra: 0,
    commission: 0,
    adjustments: 0,
    cancellationFees: 0,
    netCommission: 0,
    net: 0,
  };
}

export function summarizeDrive(reservations: Reservation[], range?: DateRange): DriveSummary {
  const items = range
    ? reservations.filter((item) => inRange(item.date, range.from, range.to))
    : reservations;
  const summary = emptyDriveSummary();

  for (const item of items) {
    const finance = calculateReservationFinance(item);
    if (item.status === "Completed") {
      summary.completedCount += 1;
      summary.expectedRevenue += finance.expectedAmount;
      summary.actualReceived += finance.amountReceived;
      summary.missing += finance.missingAmount;
      summary.extra += finance.extraAmount;
      summary.commission += finance.commission;
      summary.adjustments += toSignedMoney(item.adjustmentAmount);
    } else if (isCancelledStatus(item.status)) {
      summary.cancelledCount += 1;
      if (finance.countsAsRevenue) {
        summary.cancellationFees += toMoney(item.cancellationFee);
        summary.actualReceived += finance.amountReceived;
        summary.commission += finance.commission;
        summary.adjustments += toSignedMoney(item.adjustmentAmount);
      }
    }
  }

  summary.netCommission = roundMoney(summary.commission - summary.missing);
  summary.net = roundMoney(summary.actualReceived - summary.commission - summary.adjustments);
  return summary;
}
