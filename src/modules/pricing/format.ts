export function formatPriceLabel(input: {
  priceType: string | null;
  priceMin: string | null;
  currency: string | null;
}): string {
  if (!input.priceType || input.priceType === "UNKNOWN") return "Price TBA";
  if (input.priceType === "FREE") return "Free";

  const currency = input.currency ?? "INR";
  const amount = input.priceMin ? Number(input.priceMin) : null;

  if (amount == null || Number.isNaN(amount)) {
    return input.priceType === "RANGE" ? "Paid" : "Paid";
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  if (input.priceType === "RANGE") return `${formatted} onwards`;
  return formatted;
}
