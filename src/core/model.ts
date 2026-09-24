// Unit economics of one marketplace order, and the ROAS it can afford.
//
//   CM1 = price - landed cost                               (gross margin)
//   CM2 = CM1 - platform fees - returns - other variable     (profit before ads)
//   Max CPA          = CM2                                   (break-even ad cost per order)
//   Break-even ROAS  = price / Max CPA
//   Target CPA       = price / target ROAS
//   CM3 = CM2 - target CPA                                   (net profit per ad-driven order)
//   Safety margin    = (target ROAS - break-even ROAS) / target ROAS
//
// The model matches the one behind Ordinex's seller tools, so the numbers agree.

export interface UnitInput {
  /** Selling price per order, after seller discounts, VND. */
  price: number;
  /** Landed cost per order: product, freight, import tax, packaging. VND. */
  landedCost: number;
  /** Platform commission, % of price. */
  commissionPct: number;
  /** Payment (transaction) fee, % of price. */
  paymentFeePct: number;
  /** Tax the platform withholds, % of price (1% VAT + 0.5% PIT for household businesses). */
  taxWithheldPct: number;
  /** Voucher Xtra contribution, % of price, 0 if not enrolled. */
  voucherXtraPct: number;
  /** Cap on the Voucher Xtra fee per order, VND. 0 means no cap. */
  voucherXtraCap: number;
  /** Flat order processing fee, VND per order. */
  orderFee: number;
  /** Shipping the seller pays or reimburses, VND per order. */
  shippingSubsidy: number;
  /** Revenue lost to returns and refunds, %. */
  returnRatePct: number;
  /** Other variable cost, % of price: warehouse, staff, payment on delivery. */
  otherPct: number;
  /** Affiliate (KOC) commission on affiliate orders, % of price. */
  affiliatePct: number;
  /** The ROAS the ad plan is built on. */
  targetRoas: number;
  /** Net margin after ads you want to keep, %. */
  targetMarginPct: number;
}

export type SafetyTier = "losing" | "fragile" | "watch" | "healthy";

export interface UnitResult {
  cm1: number;
  fees: { commission: number; payment: number; tax: number; voucherXtra: number; orderFee: number; shipping: number; total: number };
  returns: number;
  other: number;
  cm2: number;
  maxCpa: number;
  /** Infinity when the order loses money before any ad spend. */
  breakevenRoas: number;
  /** Ad spend as % of revenue at break-even: 100 / break-even ROAS. */
  breakevenAdsPct: number;
  targetCpa: number;
  cm3: number;
  cm3Pct: number;
  safety: number;
  tier: SafetyTier;
  /** ROAS needed to keep targetMarginPct after ads. Infinity if unreachable. */
  roasForTargetMargin: number;
  affiliate: { organic: number; withAds: number };
}

const pct = (price: number, p: number) => (price * p) / 100;

export function computeFees(i: UnitInput): UnitResult["fees"] {
  const commission = pct(i.price, i.commissionPct);
  const payment = pct(i.price, i.paymentFeePct);
  const tax = pct(i.price, i.taxWithheldPct);
  const rawVoucher = pct(i.price, i.voucherXtraPct);
  const voucherXtra = i.voucherXtraCap > 0 ? Math.min(rawVoucher, i.voucherXtraCap) : rawVoucher;
  const orderFee = i.orderFee;
  const shipping = i.shippingSubsidy;
  return { commission, payment, tax, voucherXtra, orderFee, shipping, total: commission + payment + tax + voucherXtra + orderFee + shipping };
}

export function safetyTier(safety: number, cm2: number): SafetyTier {
  if (cm2 <= 0) return "losing";
  if (safety < 0.15) return "fragile";
  if (safety < 0.3) return "watch";
  return "healthy";
}

export function computeUnit(i: UnitInput): UnitResult {
  const cm1 = i.price - i.landedCost;
  const fees = computeFees(i);
  const returns = pct(i.price, i.returnRatePct);
  const other = pct(i.price, i.otherPct);
  const cm2 = cm1 - fees.total - returns - other;
  const maxCpa = cm2;
  const breakevenRoas = maxCpa > 0 ? i.price / maxCpa : Number.POSITIVE_INFINITY;
  const breakevenAdsPct = maxCpa > 0 ? (maxCpa / i.price) * 100 : 0;
  const targetCpa = i.targetRoas > 0 ? i.price / i.targetRoas : 0;
  const cm3 = cm2 - targetCpa;
  const cm3Pct = i.price > 0 ? (cm3 / i.price) * 100 : 0;
  const safety = !Number.isFinite(breakevenRoas) ? -1 : i.targetRoas > 0 ? (i.targetRoas - breakevenRoas) / i.targetRoas : 0;
  const room = cm2 - pct(i.price, i.targetMarginPct);
  const roasForTargetMargin = room > 0 ? i.price / room : Number.POSITIVE_INFINITY;
  const affiliateCost = pct(i.price, i.affiliatePct);
  return {
    cm1,
    fees,
    returns,
    other,
    cm2,
    maxCpa,
    breakevenRoas,
    breakevenAdsPct,
    targetCpa,
    cm3,
    cm3Pct,
    safety,
    tier: safetyTier(safety, cm2),
    roasForTargetMargin,
    affiliate: { organic: cm2 - affiliateCost, withAds: cm3 - affiliateCost },
  };
}

export interface SensitivityRow {
  roas: number;
  adsPct: number;
  profit: number;
  marginPct: number;
}

/** Net profit per ad-driven order across a range of ROAS values. */
export function sensitivity(i: UnitInput, roasValues = [1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]): SensitivityRow[] {
  const { cm2 } = computeUnit(i);
  return roasValues.map((roas) => {
    const cpa = i.price / roas;
    const profit = cm2 - cpa;
    return { roas, adsPct: 100 / roas, profit, marginPct: i.price > 0 ? (profit / i.price) * 100 : 0 };
  });
}

/** TikTok Shop Vietnam defaults as of September 2026. Check your seller center for your shop. */
export const TIKTOK_VN_DEFAULTS: UnitInput = {
  price: 199_000,
  landedCost: 85_000,
  commissionPct: 14,
  paymentFeePct: 6,
  taxWithheldPct: 1.5,
  voucherXtraPct: 0,
  voucherXtraCap: 50_000,
  orderFee: 3_000,
  shippingSubsidy: 0,
  returnRatePct: 5,
  otherPct: 0,
  affiliatePct: 10,
  targetRoas: 5,
  targetMarginPct: 10,
};
