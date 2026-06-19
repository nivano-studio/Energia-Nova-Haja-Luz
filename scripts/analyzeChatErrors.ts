// This script is intended to be run manually via Node (e.g. npx ts-node scripts/analyzeChatErrors.ts)
// It reads a local JSON file of learning logs and produces a summary.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: since the app writes to localStorage, the developer must manually export
// the `chat_learning_logs` from localStorage and save it as `chat-learning-log.json`
// in the project root to analyze it here.

const LOG_FILE = path.join(__dirname, '..', 'chat-learning-log.json');

function analyzeLogs() {
  if (!fs.existsSync(LOG_FILE)) {
    console.error(`Log file not found at ${LOG_FILE}.`);
    console.error(`Please export the 'chat_learning_logs' from localStorage and save it there.`);
    process.exit(1);
  }

  const data = fs.readFileSync(LOG_FILE, 'utf-8');
  let logs: any[] = [];
  try {
    logs = JSON.parse(data);
  } catch (err) {
    console.error("Error parsing log JSON:", err);
    process.exit(1);
  }

  console.log(`=== Chat Error Analysis ===\nTotal logs: ${logs.length}\n`);

  const fallbacks = logs.filter(l => l.detectedIntent === 'off_topic' || l.detectedIntent === 'ask_disambiguation');
  const lowConfidence = logs.filter(l => l.confidence < 0.6);
  const userCorrections = logs.filter(l => !!l.userCorrection);

  console.log(`Fallbacks / Disambiguations: ${fallbacks.length}`);
  console.log(`Low Confidence Responses: ${lowConfidence.length}`);
  console.log(`User Corrections: ${userCorrections.length}\n`);

  // Group recurring unrecognized terms
  const termsCount: Record<string, number> = {};
  logs.forEach(l => {
    if (l.confidence < 0.6) {
      const words = l.cleanInput.split(' ');
      words.forEach((w: string) => {
        if (w.length > 3) {
          termsCount[w] = (termsCount[w] || 0) + 1;
        }
      });
    }
  });

  const sortedTerms = Object.entries(termsCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log("Top 10 frequent terms in low-confidence inputs:");
  sortedTerms.forEach(([term, count]) => console.log(`  - ${term}: ${count} times`));

  console.log("\nSuggestions:");
  if (sortedTerms.length > 0) {
    console.log("Consider adding the following terms to 'typos.json', 'synonyms.json', or 'productTaxonomy.ts':");
    sortedTerms.forEach(([term]) => console.log(`  ${term}`));
  }
}

analyzeLogs();
