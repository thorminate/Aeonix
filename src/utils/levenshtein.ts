export default function levenshtein(a: string, b: string) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1];
      } else {
        dp[i]![j] =
          1 + Math.min(dp[i - 1]![j], dp[i]![j - 1], dp[i - 1]![j - 1]);
      }
    }
  }
  return dp[m]![n];
}

export function fuzzyMatch(keyword: string, string: string, threshold = 2) {
  return levenshtein(keyword.toLowerCase(), string.toLowerCase()) <= threshold;
}

export function search(keyword: string, text: string, threshold = 2) {
  keyword = keyword.toLowerCase();
  text = text.toLowerCase();

  const kwTokens = tokenize(keyword);
  const txtTokens = tokenize(text);
  return kwTokens.every((token) =>
    txtTokens.some((t) => fuzzyMatch(token, t, threshold))
  );
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
