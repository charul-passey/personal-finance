export interface RuleRecord {
  id: number
  pattern: string
  matchType: string     // 'contains' | 'regex' | 'exact'
  accountId: number | null
  categoryId: number
  categoryName: string
  priority: number
}

export function applyRules(
  description: string,
  accountId: number,
  amountCents: number,
  rules: RuleRecord[]
): { categoryId: number | null; categoryName: string | null } {
  // Sort descending by priority once
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    // Account scope check
    if (rule.accountId !== null && rule.accountId !== accountId) continue;

    if (!matchesRule(description, rule)) continue;

    // Loan remittance guard: only large outflows (> $1000)
    if (rule.categoryName === "Loan remittance" && amountCents > -100_000) continue;

    return { categoryId: rule.categoryId, categoryName: rule.categoryName };
  }

  return { categoryId: null, categoryName: null };
}

function matchesRule(description: string, rule: RuleRecord): boolean {
  const { pattern, matchType } = rule;
  switch (matchType) {
    case "contains":
      return description.toUpperCase().includes(pattern.toUpperCase());
    case "regex":
      try {
        return new RegExp(pattern, "i").test(description);
      } catch {
        return false;
      }
    case "exact":
      return description.toUpperCase() === pattern.toUpperCase();
    default:
      return false;
  }
}
