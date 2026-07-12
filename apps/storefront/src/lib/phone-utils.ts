const OPERATORS = [
  { prefix: "017", name: "Grameenphone" },
  { prefix: "013", name: "Grameenphone" },
  { prefix: "018", name: "Robi" },
  { prefix: "014", name: "Robi" },
  { prefix: "019", name: "Banglalink" },
  { prefix: "016", name: "Airtel" },
  { prefix: "015", name: "Teletalk" },
];

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+880")) return cleaned;
  if (cleaned.startsWith("880")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+88${cleaned}`;
  if (cleaned.startsWith("1")) return `+880${cleaned}`;
  return cleaned;
}

export function validateBDPhone(
  phone: string
): { valid: boolean; operator: string; error?: string } {
  const cleaned = phone.replace(/[^\d]/g, "");
  if (!cleaned) return { valid: false, operator: "", error: "Phone number is required" };

  if (cleaned.startsWith("88")) {
    const withoutCC = cleaned.slice(2);
    return validateBDPhone(withoutCC);
  }

  if (cleaned.startsWith("0")) {
    return validateBDPhone(cleaned.slice(1));
  }

  if (cleaned.length !== 10)
    return { valid: false, operator: "", error: "Must be 10 digits after code" };

  if (!cleaned.startsWith("1"))
    return { valid: false, operator: "", error: "Invalid Bangladeshi number" };

  const op = OPERATORS.find((o) => cleaned.startsWith(o.prefix));
  if (!op)
    return { valid: false, operator: "", error: "Unknown operator" };

  return { valid: true, operator: op.name };
}
