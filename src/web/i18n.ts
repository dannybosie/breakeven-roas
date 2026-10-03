export type Lang = "en" | "vi";

export const STRINGS = {
  en: {
    tagline: "Break-even ROAS calculator for TikTok Shop Vietnam",
    lede: "Put in a price and a landed cost. See how much each order can pay for ads, the ROAS you have to beat, and what is left at the ROAS you plan for. Commission comes from the category, fees from TikTok Shop's current schedule.",
    product: "Product", price: "Selling price per order (VND)", landed: "Landed cost per order (VND)", landedHint: "Product, freight, import tax, packaging.",
    category: "Category", searchPh: "Search a category, e.g. gấu bông, son môi, tai nghe", tier: "Shop type", standard: "Standard", mall: "Mall",
    commission: "Commission (%)", commissionFrom: "From the schedule effective {date}. Edit to override.",
    fees: "Platform fees", payment: "Payment fee (%)", tax: "Tax withheld (%)", taxHint: "1.5% for household businesses (1% VAT + 0.5% PIT). 0% for companies.",
    vxp: "Voucher Xtra (%)", vxpHint: "4% if enrolled, capped at 50,000 VND per order.", orderFee: "Order fee (VND)", shipping: "Shipping you pay (VND per order)",
    risk: "Returns and channels", returns: "Returns and refunds (% of revenue)", other: "Other variable cost (%)", otherHint: "Warehouse, staff, anything that scales with orders.", affiliate: "Affiliate commission (%)",
    plan: "Your ad plan", targetRoas: "Target ROAS", targetMargin: "Net margin to keep after ads (%)",
    breakevenRoas: "Break-even ROAS", breakevenSub: "Below this, every ad-driven order loses money.", maxCpa: "Max CPA", maxCpaSub: "The most one order can pay for ads.",
    atTarget: "Net profit per ad order at ROAS {roas}", safety: "Safety margin {pct}",
    tier_losing: "Losing before ads", tier_fragile: "Fragile", tier_watch: "Watch", tier_healthy: "Healthy",
    waterfall: "Where the price goes", wf_price: "Price", wf_landed: "Landed cost", wf_cm1: "CM1, gross margin", wf_fees: "Platform fees", wf_returns: "Returns and other", wf_cm2: "CM2, profit before ads", wf_ads: "Ads at target ROAS", wf_cm3: "CM3, net profit",
    needRoas: "ROAS needed to keep {margin} net margin", unreachable: "Not reachable at this price and cost.",
    table: "Profit per ad-driven order by ROAS", t_roas: "ROAS", t_ads: "Ads, % of revenue", t_profit: "Profit per order", t_margin: "Net margin",
    aff: "Affiliate orders", affOrganic: "Affiliate order, no ads", affAds: "Affiliate order also counted by ads",
    share: "Copy link to this scenario", copied: "Copied", ctaTitle: "Deciding whether to import a product at all?",
    ctaBody: "The full import calculator on ordinex.cc adds sourcing in CNY, freight per batch and a price-war check.", ctaLink: "Open the import calculator",
    fine: "Fees as of September 2026. Your seller center is the source of truth for your shop.",
    noCategory: "None chosen, so the default rate applies:",
  },
  vi: {
    tagline: "Công cụ tính ROAS hoà vốn cho TikTok Shop Việt Nam",
    lede: "Nhập giá bán và giá vốn. Xem mỗi đơn chịu được bao nhiêu tiền quảng cáo, ROAS tối thiểu phải vượt, và còn lại bao nhiêu ở ROAS bạn dự kiến. Hoa hồng lấy theo ngành hàng, phí lấy theo biểu phí hiện hành của TikTok Shop.",
    product: "Sản phẩm", price: "Giá bán mỗi đơn (VND)", landed: "Giá vốn về kho mỗi đơn (VND)", landedHint: "Tiền hàng, vận chuyển, thuế nhập khẩu, đóng gói.",
    category: "Ngành hàng", searchPh: "Tìm ngành hàng, ví dụ: gấu bông, son môi, tai nghe", tier: "Loại shop", standard: "Thường", mall: "Mall",
    commission: "Hoa hồng (%)", commissionFrom: "Theo biểu phí áp dụng từ {date}. Sửa để ghi đè.",
    fees: "Phí sàn", payment: "Phí giao dịch (%)", tax: "Thuế khấu trừ (%)", taxHint: "1,5% với hộ kinh doanh (1% GTGT + 0,5% TNCN). 0% với doanh nghiệp.",
    vxp: "Voucher Xtra (%)", vxpHint: "4% nếu tham gia, tối đa 50.000 VND mỗi đơn.", orderFee: "Phí xử lý đơn (VND)", shipping: "Phí ship shop chịu (VND mỗi đơn)",
    risk: "Hoàn hàng và kênh", returns: "Hoàn hàng, hoàn tiền (% doanh thu)", other: "Chi phí biến đổi khác (%)", otherHint: "Kho, nhân sự, mọi thứ tăng theo số đơn.", affiliate: "Hoa hồng affiliate (%)",
    plan: "Kế hoạch quảng cáo", targetRoas: "ROAS mục tiêu", targetMargin: "Biên lãi ròng muốn giữ sau quảng cáo (%)",
    breakevenRoas: "ROAS hoà vốn", breakevenSub: "Thấp hơn mức này, mỗi đơn từ quảng cáo đều lỗ.", maxCpa: "CPA tối đa", maxCpaSub: "Mỗi đơn chịu được tối đa bấy nhiêu tiền quảng cáo.",
    atTarget: "Lãi ròng mỗi đơn quảng cáo ở ROAS {roas}", safety: "Biên an toàn {pct}",
    tier_losing: "Lỗ trước quảng cáo", tier_fragile: "Mong manh", tier_watch: "Cần theo dõi", tier_healthy: "Khoẻ",
    waterfall: "Giá bán đi về đâu", wf_price: "Giá bán", wf_landed: "Giá vốn", wf_cm1: "CM1, lãi gộp", wf_fees: "Phí sàn", wf_returns: "Hoàn hàng và chi phí khác", wf_cm2: "CM2, lãi trước quảng cáo", wf_ads: "Quảng cáo ở ROAS mục tiêu", wf_cm3: "CM3, lãi ròng",
    needRoas: "ROAS cần để giữ biên lãi ròng {margin}", unreachable: "Không đạt được với giá và giá vốn này.",
    table: "Lãi mỗi đơn quảng cáo theo ROAS", t_roas: "ROAS", t_ads: "Quảng cáo, % doanh thu", t_profit: "Lãi mỗi đơn", t_margin: "Biên lãi ròng",
    aff: "Đơn affiliate", affOrganic: "Đơn affiliate, không quảng cáo", affAds: "Đơn affiliate cũng được quảng cáo ghi nhận",
    share: "Sao chép link kịch bản này", copied: "Đã chép", ctaTitle: "Đang cân nhắc có nên nhập một sản phẩm không?",
    ctaBody: "Công cụ tính giá nhập hàng trên ordinex.cc có thêm giá nhập bằng tệ, cước theo lô và kiểm tra chiến giá.", ctaLink: "Mở công cụ tính giá nhập",
    fine: "Phí cập nhật tháng 9/2026. Trung tâm người bán của bạn là nguồn chính xác nhất cho shop của bạn.",
    noCategory: "Chưa chọn ngành, đang dùng mức mặc định:",
  },
} as const;

export type Key = keyof (typeof STRINGS)["en"];

export function t(lang: Lang, key: Key, vars: Record<string, string> = {}): string {
  let s: string = STRINGS[lang][key];
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}
