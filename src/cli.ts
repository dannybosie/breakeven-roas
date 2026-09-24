import { parseArgs } from "node:util";
import { SCHEDULE, type ShopTier, categoryPath, commissionFor, searchCategories } from "./core/commission.ts";
import { TIKTOK_VN_DEFAULTS, type UnitInput, computeUnit, sensitivity } from "./core/model.ts";

const VERSION = "1.0.0";
const HELP = `breakeven-roas ${VERSION}
Unit Economics Intelligence for TikTok Shop Vietnam: break-even ROAS, max CPA and CM1 to CM3 for one order.

Usage
  breakeven-roas --price 199000 --cost 85000 [--category "gấu bông"] [--mall] [options]
  breakeven-roas categories "tai nghe"          Look up commission by category

Options (defaults are TikTok Shop Vietnam, September 2026)
  --price <vnd>           Selling price per order
  --cost <vnd>            Landed cost per order (product, freight, import tax, packaging)
  --category <text>       Category search; the best match sets the commission
  --commission <pct>      Commission, overrides --category (default ${TIKTOK_VN_DEFAULTS.commissionPct})
  --mall                  Mall shop rates
  --payment <pct>         Payment fee (default ${TIKTOK_VN_DEFAULTS.paymentFeePct})
  --tax <pct>             Tax withheld (default ${TIKTOK_VN_DEFAULTS.taxWithheldPct}; 0 for companies)
  --voucher-xtra <pct>    Voucher Xtra, capped at 50,000 per order (default 0)
  --order-fee <vnd>       Flat order fee (default ${TIKTOK_VN_DEFAULTS.orderFee})
  --shipping <vnd>        Shipping you pay per order (default 0)
  --returns <pct>         Revenue lost to returns (default ${TIKTOK_VN_DEFAULTS.returnRatePct})
  --other <pct>           Other variable cost (default 0)
  --affiliate <pct>       Affiliate commission (default ${TIKTOK_VN_DEFAULTS.affiliatePct})
  --roas <x>              Target ROAS (default ${TIKTOK_VN_DEFAULTS.targetRoas})
  --margin <pct>          Net margin to keep after ads (default ${TIKTOK_VN_DEFAULTS.targetMarginPct})
  --json                  Machine-readable output`;

const vnd = (n: number) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString("en-US")} VND` : "n/a");
const x = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "never");

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      price: { type: "string" }, cost: { type: "string" }, category: { type: "string" }, commission: { type: "string" },
      mall: { type: "boolean", default: false }, payment: { type: "string" }, tax: { type: "string" },
      "voucher-xtra": { type: "string" }, "order-fee": { type: "string" }, shipping: { type: "string" },
      returns: { type: "string" }, other: { type: "string" }, affiliate: { type: "string" }, roas: { type: "string" },
      margin: { type: "string" }, json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false }, version: { type: "boolean", short: "v", default: false },
    },
  });
  if (values.version) return console.log(VERSION), 0;
  const tier: ShopTier = values.mall ? "mall" : "standard";

  if (positionals[0] === "categories") {
    for (const c of searchCategories(positionals.slice(1).join(" "), 15)) {
      console.log(`${String(commissionFor(c, tier)).padStart(5)}%  ${categoryPath(c)}`);
    }
    return 0;
  }
  if (values.help || !values.price || !values.cost) return console.log(HELP), values.help ? 0 : 2;

  const num = (v: string | undefined, d: number) => (v === undefined ? d : Number(v));
  const match = values.category ? searchCategories(values.category, 1)[0] : undefined;
  if (values.category && !match) throw new Error(`No category matches "${values.category}".`);
  const input: UnitInput = {
    ...TIKTOK_VN_DEFAULTS,
    price: Number(values.price),
    landedCost: Number(values.cost),
    commissionPct: num(values.commission, match ? commissionFor(match, tier) : SCHEDULE.defaults[tier]),
    paymentFeePct: num(values.payment, TIKTOK_VN_DEFAULTS.paymentFeePct),
    taxWithheldPct: num(values.tax, TIKTOK_VN_DEFAULTS.taxWithheldPct),
    voucherXtraPct: num(values["voucher-xtra"], 0),
    orderFee: num(values["order-fee"], TIKTOK_VN_DEFAULTS.orderFee),
    shippingSubsidy: num(values.shipping, 0),
    returnRatePct: num(values.returns, TIKTOK_VN_DEFAULTS.returnRatePct),
    otherPct: num(values.other, 0),
    affiliatePct: num(values.affiliate, TIKTOK_VN_DEFAULTS.affiliatePct),
    targetRoas: num(values.roas, TIKTOK_VN_DEFAULTS.targetRoas),
    targetMarginPct: num(values.margin, TIKTOK_VN_DEFAULTS.targetMarginPct),
  };
  const r = computeUnit(input);
  if (values.json) return console.log(JSON.stringify({ input, category: match ?? null, result: r, sensitivity: sensitivity(input) }, null, 2)), 0;

  if (match) console.log(`Category          ${categoryPath(match)} (${input.commissionPct}% ${tier})`);
  console.log(`Price             ${vnd(input.price)}`);
  console.log(`CM1 gross margin  ${vnd(r.cm1)}`);
  console.log(`Platform fees     ${vnd(-r.fees.total)}`);
  console.log(`Returns, other    ${vnd(-(r.returns + r.other))}`);
  console.log(`CM2 before ads    ${vnd(r.cm2)}   = max CPA`);
  console.log(`Break-even ROAS   ${x(r.breakevenRoas)}`);
  console.log(`At ROAS ${x(input.targetRoas).padEnd(9)} CM3 ${vnd(r.cm3)} per order (${r.cm3Pct.toFixed(1)}%), ${r.tier}`);
  console.log(`${`ROAS for ${input.targetMarginPct}% net`.padEnd(18)}${x(r.roasForTargetMargin)}`);
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error(`breakeven-roas: ${(err as Error).message}`);
  process.exit(2);
}
