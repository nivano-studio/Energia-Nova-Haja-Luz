import { requiredCorrections, repeatedCorrections, slangDictionary, electricalTypos, probableCorrections, joinedWordsCorrections, fuzzyVocabulary } from './chatDictionaries';
import { v15ErrorCorrections } from './knowledge/v15Dictionaries';

export function normalizeText(input: string): string {
  if (!input) return "";
  
  // Replace punctuation EXCEPT decimal points or commas between numbers
  let text = input.replace(/([0-9])[.,]([0-9])/g, "$1_DECIMAL_POINT_$2");
  text = text.replace(/[?!.,;:()[\]{}"'´`~^]/g, " ");
  text = text.replace(/_DECIMAL_POINT_/g, ".");

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function reduceRepeatedLetters(text: string): string {
  return text.replace(/([a-z])\1{2,}/g, "$1$1");
}

export function replaceWholeWords(text: string, dictionary: Record<string, string>): string {
  let result = text;
  // Sort by length descending to replace longer phrases first
  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  for (const [wrong, correct] of entries) {
    const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, correct);
  }
  return result.replace(/\s+/g, " ").trim();
}

export function normalizeUnits(text: string): string {
  return text
    .replace(/(\d+)\s*v\b/gi, "$1v")
    .replace(/(\d+)\s*w\b/gi, "$1w")
    .replace(/(\d+)\s*a\b/gi, "$1a")
    .replace(/(\d+)\s*mm\b/gi, "$1mm")
    .replace(/(\d+)\s*m\b/gi, "$1m")
    .replace(/(\d+)\s*k\b/gi, "$1k")
    .replace(/(\d+)\s*x\s*(\d+)/gi, "$1x$2")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

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

function similarity(s1: string, s2: string): number {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - levenshteinDistance(longer, shorter)) / parseFloat(longerLength.toString());
}

export function fuzzyCorrectToken(token: string, vocabulary: string[]): string {
  if (token.length < 4 || /\d/.test(token)) return token;
  
  let best = { term: token, score: 0 };

  for (const term of vocabulary) {
    const score = similarity(token, term);
    if (score > best.score) best = { term, score };
  }

  if (best.score >= 0.82) return best.term;
  return token;
}

const pluralCorrections: Record<string, string> = {
  "lampadas": "lampada",
  "lâmpadas": "lampada",
  "fios": "fio",
  "cabos": "cabo",
  "tomadas": "tomada",
  "interruptores": "interruptor",
  "disjuntores": "disjuntor",
  "refletores": "refletor",
  "plafons": "plafon",
  "sensores": "sensor",
  "ventiladores": "ventilador",
  "ferramentas": "ferramenta",
  "luminarias": "luminaria"
};

export function preprocessMessage(input: string): { original: string; clean: string; normalizedSteps: string[] } {
  const steps: string[] = [];
  
  let current = input;
  steps.push(`Original: ${current}`);
  
  current = normalizeText(current);
  steps.push(`Normalized: ${current}`);
  
  current = reduceRepeatedLetters(current);
  steps.push(`Reduced letters: ${current}`);
  
  current = replaceWholeWords(current, requiredCorrections);
  steps.push(`Applied required corrections: ${current}`);
  
  current = replaceWholeWords(current, repeatedCorrections);
  steps.push(`Applied repeated corrections: ${current}`);
  
  current = replaceWholeWords(current, slangDictionary);
  steps.push(`Applied slang corrections: ${current}`);
  
  current = replaceWholeWords(current, electricalTypos);
  steps.push(`Applied electrical typos: ${current}`);
  
  current = replaceWholeWords(current, joinedWordsCorrections);
  steps.push(`Applied phrase/joined words corrections: ${current}`);

  current = replaceWholeWords(current, probableCorrections);
  steps.push(`Applied probable contextual corrections: ${current}`);

  // Apply v15ErrorCorrections
  current = replaceWholeWords(current, v15ErrorCorrections);
  steps.push(`Applied v15 error corrections: ${current}`);

  // Apply plural-to-singular normalization
  current = replaceWholeWords(current, pluralCorrections);
  steps.push(`Applied plural corrections: ${current}`);

  // Apply fuzzy matching
  const tokens = current.split(' ');
  const fuzzyTokens = tokens.map(t => fuzzyCorrectToken(t, fuzzyVocabulary));
  current = fuzzyTokens.join(' ');
  steps.push(`Applied fuzzy matching: ${current}`);
  
  current = normalizeUnits(current);
  steps.push(`Normalized units: ${current}`);
  
  return {
    original: input,
    clean: current,
    normalizedSteps: steps
  };
}
