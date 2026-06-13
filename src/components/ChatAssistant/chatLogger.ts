import type { ExtractedEntities } from './types';

export interface ChatLogEntry {
  timestamp: string;
  originalInput: string;
  cleanInput: string;
  detectedIntent: string;
  confidence: number;
  entities: ExtractedEntities | null;
  productsReturned: number;
  userCorrection?: string;
  context: boolean;
  debugReasons: string[];
}

// Coloque a URL do seu Google Apps Script aqui:
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz1g08SBJv5ySMKUWa2hf_QujrzNhlAYONMGLK3VFr_ZlAT3gn5Wy2qAZbyGP0OBLHr/exec";

export async function logInteraction(entry: ChatLogEntry) {
  // 1. Log Local (localStorage) para debug do navegador

  // A real implementation would send this to a backend endpoint.
  try {
    if (typeof localStorage !== 'undefined') {
      const existingLogsStr = localStorage.getItem('chat_learning_logs');
      let logs: ChatLogEntry[] = [];
      if (existingLogsStr) {
        logs = JSON.parse(existingLogsStr);
      }
      logs.push(entry);
      localStorage.setItem('chat_learning_logs', JSON.stringify(logs));
    }
    console.warn("[ChatLogger] Interaction logged locally:", entry);

    // 2. Envio remoto para a Planilha do Google (Se configurado)
    if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.trim() !== "") {
      try {
        fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors', // O Google Apps Script precisa de no-cors em chamadas client-side
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Evita o bloqueio de preflight do CORS
          },
          body: JSON.stringify({
            timestamp: entry.timestamp,
            originalInput: entry.originalInput,
            cleanInput: entry.cleanInput,
            detectedIntent: entry.detectedIntent,
            productsReturned: entry.productsReturned,
          })
        }).catch(err => console.error("Erro ao enviar para a planilha:", err));
      } catch (fetchError) {
        console.error("Erro no processo de fetch para a planilha:", fetchError);
      }
    }
  } catch (err) {
    console.error("Failed to log interaction", err);
  }
}
