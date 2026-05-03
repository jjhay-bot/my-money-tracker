const PAYMENT_METHODS = [
  { aliases: ["cash"], label: "Cash" },
  { aliases: ["gcash"], label: "GCash" },
  { aliases: ["maya"], label: "Maya" },
  { aliases: ["bank transfer"], label: "Bank Transfer" },
  { aliases: ["bank"], label: "Bank" },
  { aliases: ["card"], label: "Card" },
];

const INCOME_KEYWORDS = ["salary", "income", "freelance", "allowance", "bonus"];

const categoryFromTitle = (title, type) => {
  if (type === "in") return "Income";
  const lower = title.toLowerCase();
  if (lower.includes("coffee")) return "Coffee";
  if (lower.includes("gas")) return "Transport";
  if (lower.includes("grocery")) return "Groceries";
  if (lower.includes("kfc") || lower.includes("food")) return "Food";
  if (lower.includes("bill") || lower.includes("electric")) return "Bills";
  return "Others";
};

const parseAmount = (text) => {
  const match = text.match(/(\d+(?:\.\d+)?)(k)?/i);
  if (!match) return 0;
  const value = Number(match[1]);
  if (Number.isNaN(value)) return 0;
  return match[2] ? Math.round(value * 1000) : Math.round(value);
};

const detectPaymentMethod = (text) => {
  const lower = text.toLowerCase();
  for (const method of PAYMENT_METHODS) {
    for (const alias of method.aliases) {
      if (lower.includes(alias)) return method.label;
    }
  }
  return "Cash";
};

export const parseTransactionText = (rawInput) => {
  const rawText = (rawInput || "").trim();
  if (!rawText) return null;

  const lower = rawText.toLowerCase();
  const amount = parseAmount(rawText);
  const isIncome = INCOME_KEYWORDS.some((keyword) => lower.includes(keyword));
  const type = isIncome ? "in" : "out";
  const paymentMethod = detectPaymentMethod(rawText);

  let title = rawText
    .replace(/(\d+(?:\.\d+)?k?)/gi, " ")
    .replace(/\b(cash|gcash|maya|bank transfer|bank|card)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!title) title = isIncome ? "Income" : "Expense";

  const normalizedTitle = title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const now = new Date();
  const date = now.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  const time = now.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: normalizedTitle,
    amount,
    date,
    time,
    category: categoryFromTitle(normalizedTitle, type),
    paymentMethod,
    note: "",
    rawText,
    createdAt: now.toISOString(),
  };
};
