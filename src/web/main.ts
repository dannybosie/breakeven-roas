import { type Category, SCHEDULE, type ShopTier, categoryPath, commissionFor, searchCategories } from "../core/commission.ts";
import { TIKTOK_VN_DEFAULTS, type UnitInput, computeUnit, sensitivity } from "../core/model.ts";
import { type Key, type Lang, t } from "./i18n.ts";

const FIELDS = [
  "price", "landedCost", "commissionPct", "paymentFeePct", "taxWithheldPct", "voucherXtraPct",
  "orderFee", "shippingSubsidy", "returnRatePct", "otherPct", "affiliatePct", "targetRoas", "targetMarginPct",
] as const;

interface State {
  input: UnitInput;
  tier: ShopTier;
  category: Category | null;
  lang: Lang;
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const state: State = {
  input: { ...TIKTOK_VN_DEFAULTS },
  tier: "standard",
  category: null,
  lang: navigator.language?.toLowerCase().startsWith("vi") ? "vi" : "en",
};

// A shared link restores the scenario.
try {
  const raw = location.hash.slice(1);
  if (raw) {
    const saved = JSON.parse(decodeURIComponent(escape(atob(raw.replace(/-/g, "+").replace(/_/g, "/")))));
    Object.assign(state.input, saved.input ?? {});
    if (saved.tier === "mall" || saved.tier === "standard") state.tier = saved.tier;
    if (saved.lang === "vi" || saved.lang === "en") state.lang = saved.lang;
    if (saved.category) state.category = saved.category;
  }
} catch {
  // Ignore a malformed link and start from the defaults.
}

const L = (key: Key, vars?: Record<string, string>) => t(state.lang, key, vars);
const locale = () => (state.lang === "vi" ? "vi-VN" : "en-US");
const vnd = (n: number) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString(locale())} ₫` : "n/a");
const pctf = (n: number, d = 1) => (Number.isFinite(n) ? `${n.toLocaleString(locale(), { maximumFractionDigits: d, minimumFractionDigits: d })}%` : "n/a");
const roasf = (n: number) => (Number.isFinite(n) ? `${n.toLocaleString(locale(), { maximumFractionDigits: 2, minimumFractionDigits: 2 })}x` : "∞");

function applyLanguage(): void {
  document.documentElement.lang = state.lang;
  for (const el of document.querySelectorAll<HTMLElement>("[data-i]")) el.textContent = L(el.dataset.i as Key);
  for (const el of document.querySelectorAll<HTMLInputElement>("[data-i-ph]")) el.placeholder = L(el.dataset.iPh as Key);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang));
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-tier]")) b.setAttribute("aria-pressed", String(b.dataset.tier === state.tier));
}

function fillInputs(): void {
  for (const f of FIELDS) $<HTMLInputElement>(f).value = String(state.input[f]);
}

function readInputs(): void {
  for (const f of FIELDS) {
    const v = Number($<HTMLInputElement>(f).value.replace(/[^\d.,-]/g, "").replace(/,/g, ""));
    if (Number.isFinite(v)) state.input[f] = v;
  }
}

function renderCategory(): void {
  const chosen = $("cat-chosen");
  if (state.category) {
    chosen.innerHTML = `<b>${esc(state.category.l3)}</b> <span class="muted">${esc(categoryPath(state.category))}</span>`;
  } else {
    chosen.innerHTML = `<span class="muted">${esc(L("noCategory"))} ${pctf(SCHEDULE.defaults[state.tier])}</span>`;
  }
  $("commission-hint").textContent = L("commissionFrom", { version: SCHEDULE.version });
}

function tierTag(tier: string): string {
  const cls = tier === "healthy" ? "ok" : tier === "watch" ? "warn" : "err";
  return `<span class="tag ${cls}">${esc(L(`tier_${tier}` as Key))}</span>`;
}

function renderResults(): void {
  const i = state.input;
  const r = computeUnit(i);

  $("cards").innerHTML = `
    <div class="panel card"><div class="label">${esc(L("breakevenRoas"))}</div><div class="value">${roasf(r.breakevenRoas)}</div><div class="sub">${esc(L("breakevenSub"))}</div></div>
    <div class="panel card"><div class="label">${esc(L("maxCpa"))}</div><div class="value">${vnd(r.maxCpa)}</div><div class="sub">${esc(L("maxCpaSub"))}</div></div>
    <div class="panel card"><div class="label">${esc(L("atTarget", { roas: roasf(i.targetRoas) }))}</div><div class="value" style="color:${r.cm3 >= 0 ? "var(--accent)" : "var(--err)"}">${vnd(r.cm3)}</div><div class="sub">${tierTag(r.tier)} ${r.tier === "losing" ? "" : esc(L("safety", { pct: pctf(r.safety * 100, 0) }))}</div></div>`;

  // Waterfall, scaled to the price, with room for negative totals.
  const min = Math.min(0, r.cm2, r.cm3);
  const span = Math.max(i.price - min, 1);
  const pos = (x: number) => ((x - min) / span) * 100;
  const bar = (from: number, to: number, cls: string) =>
    `<div class="wf-bar ${cls}" style="left:${pos(Math.min(from, to))}%;width:${Math.max(0.4, Math.abs(pos(to) - pos(from)))}%"></div>`;
  const fees = r.fees.total;
  const rows: [Key, number, string, boolean][] = [
    ["wf_price", i.price, bar(0, i.price, "mid"), true],
    ["wf_landed", -i.landedCost, bar(r.cm1, i.price, "neg"), false],
    ["wf_cm1", r.cm1, bar(0, r.cm1, r.cm1 >= 0 ? "pos" : "neg"), true],
    ["wf_fees", -fees, bar(r.cm1 - fees, r.cm1, "neg"), false],
    ["wf_returns", -(r.returns + r.other), bar(r.cm2, r.cm1 - fees, "neg"), false],
    ["wf_cm2", r.cm2, bar(0, r.cm2, r.cm2 >= 0 ? "pos" : "neg"), true],
    ["wf_ads", -r.targetCpa, bar(r.cm3, r.cm2, "neg"), false],
    ["wf_cm3", r.cm3, bar(0, r.cm3, r.cm3 >= 0 ? "pos" : "neg"), true],
  ];
  $("waterfall").innerHTML = rows
    .map(([k, amt, b, total]) => `<div class="wf-row${total ? " total" : ""}"><span>${esc(L(k))}</span><div class="wf-track">${b}</div><span class="amt">${vnd(amt)}</span></div>`)
    .join("");

  $("need-roas").innerHTML = `${esc(L("needRoas", { margin: pctf(i.targetMarginPct, 0) }))}: <b>${Number.isFinite(r.roasForTargetMargin) ? roasf(r.roasForTargetMargin) : esc(L("unreachable"))}</b>`;

  const sens = sensitivity(i);
  let crossed = false;
  $("sens").innerHTML =
    `<thead><tr><th>${esc(L("t_roas"))}</th><th class="num">${esc(L("t_ads"))}</th><th class="num">${esc(L("t_profit"))}</th><th class="num">${esc(L("t_margin"))}</th></tr></thead><tbody>` +
    sens
      .map((row) => {
        const be = !crossed && row.profit >= 0;
        if (be) crossed = true;
        return `<tr class="${be ? "be" : ""}"><td class="mono">${roasf(row.roas)}</td><td class="num">${pctf(row.adsPct)}</td><td class="num" style="color:${row.profit >= 0 ? "var(--accent)" : "var(--err)"}">${vnd(row.profit)}</td><td class="num">${pctf(row.marginPct)}</td></tr>`;
      })
      .join("") +
    "</tbody>";

  $("aff").innerHTML = `${esc(L("affOrganic"))}: <b>${vnd(r.affiliate.organic)}</b><br>${esc(L("affAds"))} (ROAS ${roasf(i.targetRoas)}): <b style="color:${r.affiliate.withAds >= 0 ? "var(--accent)" : "var(--err)"}">${vnd(r.affiliate.withAds)}</b>`;
}

function render(): void {
  applyLanguage();
  renderCategory();
  renderResults();
}

function shareLink(): string {
  const json = JSON.stringify({ input: state.input, tier: state.tier, lang: state.lang, category: state.category });
  const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${location.origin}${location.pathname}#${b64}`;
}

function pickCategory(c: Category | null): void {
  state.category = c;
  state.input.commissionPct = c ? commissionFor(c, state.tier) : SCHEDULE.defaults[state.tier];
  $<HTMLInputElement>("commissionPct").value = String(state.input.commissionPct);
  $("cat-results").innerHTML = "";
  $<HTMLInputElement>("cat-search").value = "";
  render();
}

$("form").addEventListener("input", (ev) => {
  if ((ev.target as HTMLElement).id === "cat-search") return;
  readInputs();
  renderResults();
});

$("cat-search").addEventListener("input", () => {
  const hits = searchCategories($<HTMLInputElement>("cat-search").value, 30);
  $("cat-results").innerHTML = hits
    .map((c, n) => `<li><button type="button" data-n="${n}"><span>${esc(c.l3)}<br><span class="path">${esc(categoryPath(c))}</span></span><span class="mono">${pctf(commissionFor(c, state.tier))}</span></button></li>`)
    .join("");
  $("cat-results").onclick = (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>("button[data-n]");
    if (btn) pickCategory(hits[Number(btn.dataset.n)]);
  };
});

$("tier").addEventListener("click", (ev) => {
  const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>("[data-tier]");
  if (!btn) return;
  state.tier = btn.dataset.tier as ShopTier;
  pickCategory(state.category);
});

for (const b of document.querySelectorAll<HTMLButtonElement>("[data-lang]")) {
  b.addEventListener("click", () => {
    state.lang = b.dataset.lang as Lang;
    render();
  });
}

$("share").addEventListener("click", async () => {
  const btn = $<HTMLButtonElement>("share");
  const link = shareLink();
  history.replaceState(null, "", link);
  try {
    await navigator.clipboard.writeText(link);
    btn.textContent = L("copied");
  } catch {
    btn.textContent = link;
  }
  setTimeout(() => (btn.textContent = L("share")), 1600);
});

fillInputs();
render();
