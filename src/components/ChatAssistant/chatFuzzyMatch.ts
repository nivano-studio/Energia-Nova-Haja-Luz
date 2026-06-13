/**
 * Calculates the Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates a similarity score between 0 and 1.
 * 1 means identical, 0 means completely different.
 */
export function stringSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const distance = levenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);
  return (maxLength - distance) / maxLength;
}

/**
 * Applies fuzzy matching to correct a token based on a given vocabulary.
 * Only applies if token length >= 4, it's not a pure number, and similarity >= threshold.
 */
export function fuzzyCorrectToken(token: string, vocabulary: string[], threshold: number = 0.82): { term: string; score: number } {
  // Do not correct very short words or pure numbers
  if (token.length < 4 || !isNaN(Number(token))) {
    return { term: token, score: 1 };
  }

  let bestMatch = { term: token, score: 0 };

  for (const term of vocabulary) {
    const score = stringSimilarity(token, term);
    if (score > bestMatch.score) {
      bestMatch = { term, score };
    }
  }

  if (bestMatch.score >= threshold) {
    return bestMatch;
  }

  // Fallback to original token if no match meets the threshold
  return { term: token, score: 1 };
}
