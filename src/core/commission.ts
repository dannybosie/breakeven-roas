// TikTok Shop Vietnam commission by category, from the open dataset
// github.com/dannybosie/tiktok-shop-vn-commission-rates (CC BY 4.0).
import data from "../../data/commission.json" with { type: "json" };

export type ShopTier = "standard" | "mall";

export interface Category {
  group: string;
  l1: string;
  l2: string;
  l3: string;
  standardPct: number;
  mallPct: number;
}

export const SCHEDULE = {
  version: data.version,
  standardEffectiveFrom: data.standardEffectiveFrom,
  mallEffectiveFrom: data.mallEffectiveFrom,
  defaults: data.defaults as Record<ShopTier, number>,
};

export const CATEGORIES: Category[] = (data.entries as [string, string, string, string, number, number][]).map(
  ([group, l1, l2, l3, standardPct, mallPct]) => ({ group, l1, l2, l3, standardPct, mallPct }),
);

/** Lowercase, no Vietnamese diacritics, so "gau bong" finds "Gấu bông". */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().trim();
}

const indexed = CATEGORIES.map((c) => ({ c, l3: fold(c.l3), path: fold(`${c.group} ${c.l1} ${c.l2} ${c.l3}`) }));

/** Categories whose path contains every word of the query, leaf-name matches first. */
export function searchCategories(query: string, limit = 20): Category[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const hits = indexed.filter((x) => words.every((w) => x.path.includes(w)));
  hits.sort((a, b) => {
    const aLeaf = words.every((w) => a.l3.includes(w)) ? 0 : 1;
    const bLeaf = words.every((w) => b.l3.includes(w)) ? 0 : 1;
    return aLeaf - bLeaf || a.l3.length - b.l3.length;
  });
  return hits.slice(0, limit).map((x) => x.c);
}

export function commissionFor(c: Category, tier: ShopTier): number {
  return tier === "mall" ? c.mallPct : c.standardPct;
}

export const categoryPath = (c: Category) => [c.group, c.l1, c.l2, c.l3].join(" › ");
