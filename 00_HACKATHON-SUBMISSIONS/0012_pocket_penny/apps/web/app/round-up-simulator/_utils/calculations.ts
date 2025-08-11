export function calculateRoundUp(amount: number): number {
  return Math.ceil(amount) - amount;
}

export function calculateCompoundGrowth(monthlyContribution: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return monthlyContribution * months;
  }

  const futureValue = monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate);

  return Math.round(futureValue * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();

  if (desc.includes("grocery") || desc.includes("market") || desc.includes("food")) {
    return "Food & Groceries";
  }
  if (desc.includes("gas") || desc.includes("fuel") || desc.includes("transport")) {
    return "Transportation";
  }
  if (desc.includes("coffee") || desc.includes("restaurant") || desc.includes("dining")) {
    return "Dining Out";
  }
  if (desc.includes("shop") || desc.includes("retail") || desc.includes("store")) {
    return "Shopping";
  }
  if (desc.includes("entertainment") || desc.includes("movie") || desc.includes("game")) {
    return "Entertainment";
  }

  return "Other";
}
