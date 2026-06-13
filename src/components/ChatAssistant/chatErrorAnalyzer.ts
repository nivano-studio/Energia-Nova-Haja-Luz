import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ChatLogEntry } from './chatLogger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logPath = path.resolve(__dirname, '../../../../chat-learning-log.json');

function analyzeErrors() {
  if (!fs.existsSync(logPath)) {
    console.log("Nenhum log encontrado em:", logPath);
    return;
  }

  try {
    const data = fs.readFileSync(logPath, 'utf-8');
    const logs = JSON.parse(data);

    if (logs.length === 0) {
      console.log("Nenhum erro registrado ainda.");
      return;
    }

    const lowConfidence = logs.filter((l: ChatLogEntry) => l.confidence < 0.65);
    const fallbacks = logs.filter((l: ChatLogEntry) => l.detectedIntent === "fallback" || l.detectedIntent === "unknown");
    const zeroProducts = logs.filter((l: ChatLogEntry) => l.detectedIntent === "product_search" && l.productsReturned === 0);

    console.log("=========================================");
    console.log("📊 RELATÓRIO DE APRENDIZADO DA IA (V8)");
    console.log("=========================================");
    console.log(`Total de logs analisados: ${logs.length}`);
    console.log(`Interações com baixa confiança (<0.65): ${lowConfidence.length}`);
    console.log(`Interações que caíram no fallback: ${fallbacks.length}`);
    console.log(`Buscas que retornaram 0 produtos: ${zeroProducts.length}`);
    
    console.log("\n⚠️ Principais termos não compreendidos (Fallback / Low Confidence):");
    const unknownTerms = new Map<string, number>();
    [...lowConfidence, ...fallbacks].forEach((l: ChatLogEntry) => {
      const tokens = l.cleanInput.split(' ');
      tokens.forEach((t: string) => {
        if (t.length > 3) {
          unknownTerms.set(t, (unknownTerms.get(t) || 0) + 1);
        }
      });
    });

    const sortedTerms = Array.from(unknownTerms.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    sortedTerms.forEach(([term, count]) => {
      console.log(`- "${term}" (Apareceu ${count} vezes)`);
    });

    console.log("\n💡 Sugestões Automáticas:");
    console.log("1. Verifique se os termos acima são produtos ou sinônimos.");
    console.log("2. Adicione os termos desconhecidos nos dicionários (typos.json, synonyms.json).");
    console.log("3. Se o termo for comum, crie testes no chatAuditRunnerV2.ts para garantir o comportamento correto.");
    console.log("=========================================\n");

  } catch (error) {
    console.error("Erro ao ler o arquivo de log:", error);
  }
}

analyzeErrors();
