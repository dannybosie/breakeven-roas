import assert from "node:assert/strict";
import { test } from "node:test";
import { CATEGORIES, SCHEDULE, commissionFor, fold, searchCategories } from "../src/core/commission.ts";
import { TIKTOK_VN_DEFAULTS, type UnitInput, computeUnit, sensitivity } from "../src/core/model.ts";

const base: UnitInput = { ...TIKTOK_VN_DEFAULTS };
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);

test("worked example: a 199,000 VND order", () => {
  const r = computeUnit(base);
  // Fees: 14% commission, 6% payment, 1.5% tax withheld, 3,000 flat.
  near(r.fees.commission, 27_860);
  near(r.fees.payment, 11_940);
  near(r.fees.tax, 2_985);
  near(r.fees.total, 45_785);
  near(r.cm1, 114_000);
  near(r.returns, 9_950);
  near(r.cm2, 58_265);
  near(r.maxCpa, 58_265);
  near(r.breakevenRoas, 199_000 / 58_265); // about 3.42
  near(r.breakevenAdsPct, (58_265 / 199_000) * 100);
  near(r.targetCpa, 39_800);
  near(r.cm3, 18_465);
  near(r.safety, (5 - 199_000 / 58_265) / 5); // about 0.32
  assert.equal(r.tier, "healthy");
  near(r.affiliate.organic, 58_265 - 19_900);
  near(r.affiliate.withAds, 18_465 - 19_900);
});

test("ROAS needed for a target margin", () => {
  const r = computeUnit({ ...base, targetMarginPct: 10 });
  // Room for ads = 58,265 - 19,900 = 38,365, so ROAS = 199,000 / 38,365.
  near(r.roasForTargetMargin, 199_000 / 38_365);
  assert.equal(computeUnit({ ...base, targetMarginPct: 40 }).roasForTargetMargin, Number.POSITIVE_INFINITY);
});

test("an order that loses money before ads", () => {
  const r = computeUnit({ ...base, landedCost: 170_000 });
  assert.ok(r.cm2 < 0);
  assert.equal(r.breakevenRoas, Number.POSITIVE_INFINITY);
  assert.equal(r.tier, "losing");
  assert.equal(r.safety, -1);
});

test("safety tiers", () => {
  assert.equal(computeUnit({ ...base, targetRoas: 3.6 }).tier, "fragile");
  assert.equal(computeUnit({ ...base, targetRoas: 4.5 }).tier, "watch");
  assert.equal(computeUnit({ ...base, targetRoas: 6 }).tier, "healthy");
});

test("Voucher Xtra is capped per order", () => {
  near(computeUnit({ ...base, voucherXtraPct: 4 }).fees.voucherXtra, 7_960);
  near(computeUnit({ ...base, price: 2_000_000, voucherXtraPct: 4 }).fees.voucherXtra, 50_000);
  near(computeUnit({ ...base, price: 2_000_000, voucherXtraPct: 4, voucherXtraCap: 0 }).fees.voucherXtra, 80_000);
});

test("sensitivity crosses zero at break-even ROAS", () => {
  const rows = sensitivity(base, [2, 3, 3.42, 4, 5]);
  assert.ok(rows[0].profit < 0 && rows[1].profit < 0);
  assert.ok(Math.abs(rows[2].profit) < 200);
  assert.ok(rows[3].profit > 0 && rows[4].profit > 0);
  near(rows[4].adsPct, 20);
});

test("commission data and search", () => {
  assert.ok(CATEGORIES.length > 2000);
  assert.equal(SCHEDULE.defaults.standard, 14);
  assert.equal(fold("Gấu bông Đỏ"), "gau bong do");
  const hits = searchCategories("gau bong");
  assert.ok(hits.length > 0);
  assert.equal(fold(hits[0].l3).includes("gau bong"), true);
  const ereader = searchCategories("may doc sach dien tu")[0];
  assert.equal(commissionFor(ereader, "standard"), 10.5);
  assert.deepEqual(searchCategories("   "), []);
});
