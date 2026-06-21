/// <reference types="node" />
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { processQuery } from "../chatEngine";
import { resetChatContext } from "../chatContext";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AuditQuestion = {
  id: number;
  group: string;
  input: string;
};

type AuditConversation = {
  id: number;
  group: string;
  messages: string[];
};

function safeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProductSummary(products: any[] = []) {
  return products.map((p) => ({
    name: p.name || p.title || p.nome || "Produto sem nome",
    category: p.category || p.categoria || "",
    priceDisplay: "Valor sob consulta"
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getActionSummary(actions: any[] = []) {
  return actions.map((a) => ({
    label: a.label || "",
    type: a.type || ""
  }));
}

function runSingleQuestion(question: AuditQuestion) {
  resetChatContext?.();

  const response = processQuery(question.input);

  return {
    id: question.id,
    group: question.group,
    input: question.input,
    responseText: response.text || "",
    intent: response.intent || "",
    confidence: response.confidence ?? null,
    products: getProductSummary(safeArray(response.products)),
    actions: getActionSummary(safeArray(response.actions)),
    whatsappBtn: Boolean(response.whatsappBtn),
    suggestedQuestions: safeArray(response.suggestedQuestions),
    debug: response.debug || null
  };
}

function runConversation(conversation: AuditConversation) {
  resetChatContext?.();

  const turns = conversation.messages.map((message, index) => {
    const response = processQuery(message);

    return {
      id: Number(`${conversation.id}${index + 1}`),
      group: conversation.group,
      input: message,
      responseText: response.text || "",
      intent: response.intent || "",
      confidence: response.confidence ?? null,
      products: getProductSummary(safeArray(response.products)),
      actions: getActionSummary(safeArray(response.actions)),
      whatsappBtn: Boolean(response.whatsappBtn),
      suggestedQuestions: safeArray(response.suggestedQuestions),
      debug: response.debug || null
    };
  });

  const lastTurn = turns[turns.length - 1];

  return {
    id: conversation.id,
    group: conversation.group,
    messages: conversation.messages,
    turns,
    finalIntent: lastTurn?.intent || "",
    finalResponseText: lastTurn?.responseText || ""
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTextReport(singleResults: any[], conversationResults: any[]) {
  const lines: string[] = [];

  lines.push("RELATÓRIO DE AUDITORIA LOCAL — IA HAJA LUZ");
  lines.push("Gerado automaticamente pelo chatAuditRunner.ts");
  lines.push("=".repeat(80));
  lines.push("");

  lines.push("RESUMO");
  lines.push("-".repeat(80));
  lines.push(`Perguntas isoladas testadas: ${singleResults.length}`);
  lines.push(`Conversas testadas: ${conversationResults.length}`);
  lines.push("");

  lines.push("PERGUNTAS ISOLADAS");
  lines.push("=".repeat(80));

  for (const result of singleResults) {
    lines.push("");
    lines.push(`[${result.id}] Grupo: ${result.group}`);
    lines.push(`Pergunta: ${result.input}`);
    lines.push(`Intent: ${result.intent || "SEM INTENT"}`);
    lines.push(`Confidence: ${result.confidence ?? "SEM CONFIDENCE"}`);
    lines.push(`WhatsApp: ${result.whatsappBtn ? "Sim" : "Não"}`);

    lines.push("Resposta:");
    lines.push(result.responseText || "SEM RESPOSTA");

    lines.push("Produtos:");
    if (result.products.length === 0) {
      lines.push("- Nenhum produto retornado");
    } else {
      for (const product of result.products) {
        lines.push(`- ${product.name} | Categoria: ${product.category || "-"} | Valor sob consulta`);
      }
    }

    lines.push("Ações/Botões:");
    if (result.actions.length === 0) {
      lines.push("- Nenhuma ação retornada");
    } else {
      for (const action of result.actions) {
        lines.push(`- ${action.label} | Tipo: ${action.type || "-"}`);
      }
    }

    if (result.suggestedQuestions.length > 0) {
      lines.push("Sugestões:");
      for (const suggestion of result.suggestedQuestions) {
        lines.push(`- ${suggestion}`);
      }
    }

    lines.push("-".repeat(80));
  }

  lines.push("");
  lines.push("CONVERSAS COM CONTEXTO");
  lines.push("=".repeat(80));

  for (const conversation of conversationResults) {
    lines.push("");
    lines.push(`[CONVERSA ${conversation.id}] Grupo: ${conversation.group}`);
    lines.push(`Mensagens: ${conversation.messages.join(" -> ")}`);
    lines.push(`Intent final: ${conversation.finalIntent || "SEM INTENT"}`);

    for (const turn of conversation.turns) {
      lines.push("");
      lines.push(`Usuário: ${turn.input}`);
      lines.push(`Intent: ${turn.intent || "SEM INTENT"}`);
      lines.push(`Confidence: ${turn.confidence ?? "SEM CONFIDENCE"}`);
      lines.push("Resposta:");
      lines.push(turn.responseText || "SEM RESPOSTA");

      lines.push("Produtos:");
      if (turn.products.length === 0) {
        lines.push("- Nenhum produto retornado");
      } else {
        for (const product of turn.products) {
          lines.push(`- ${product.name} | Categoria: ${product.category || "-"} | Valor sob consulta`);
        }
      }

      lines.push("Ações/Botões:");
      if (turn.actions.length === 0) {
        lines.push("- Nenhuma ação retornada");
      } else {
        for (const action of turn.actions) {
          lines.push(`- ${action.label} | Tipo: ${action.type || "-"}`);
        }
      }
    }

    lines.push("-".repeat(80));
  }

  return lines.join("\n");
}

const singleQuestions: AuditQuestion[] = [
  // Saudações e erros de saudação
  { id: 1, group: "Saudações", input: "oi" },
  { id: 2, group: "Saudações", input: "oii" },
  { id: 3, group: "Saudações", input: "oiii" },
  { id: 4, group: "Saudações", input: "oire" },
  { id: 5, group: "Saudações", input: "oie" },
  { id: 6, group: "Saudações", input: "olaaa" },
  { id: 7, group: "Saudações", input: "opa" },
  { id: 8, group: "Saudações", input: "eai" },
  { id: 9, group: "Saudações", input: "hello" },

  // Cortesia
  { id: 20, group: "Cortesia", input: "como esta?" },
  { id: 21, group: "Cortesia", input: "como vai?" },
  { id: 22, group: "Cortesia", input: "tudo bem?" },
  { id: 23, group: "Cortesia", input: "blz?" },
  { id: 24, group: "Cortesia", input: "eai tudo bem" },

  // Abreviações
  { id: 40, group: "Abreviações", input: "vc tem fio" },
  { id: 41, group: "Abreviações", input: "vcs tem lampada" },
  { id: 42, group: "Abreviações", input: "ce tem tomada" },
  { id: 43, group: "Abreviações", input: "qto custa lampada" },
  { id: 44, group: "Abreviações", input: "oq e luz fria" },
  { id: 45, group: "Abreviações", input: "tem zap" },
  { id: 46, group: "Abreviações", input: "manda wpp" },

  // Produto / categorias
  { id: 70, group: "Produtos", input: "me fala sobre as lampadas disponiveis" },
  { id: 71, group: "Produtos", input: "tem lampada led?" },
  { id: 72, group: "Produtos", input: "tem mais lampadas melhores?" },
  { id: 73, group: "Produtos", input: "tem fio?" },
  { id: 74, group: "Produtos", input: "tem tomada 20a?" },
  { id: 75, group: "Produtos", input: "tem disjuntor?" },
  { id: 76, group: "Produtos", input: "tem refletor?" },
  { id: 77, group: "Produtos", input: "tem ventilador?" },
  { id: 78, group: "Produtos", input: "tem ferramenta?" },

  // Erros de digitação
  { id: 100, group: "Erros de digitação", input: "tem lanpada" },
  { id: 101, group: "Erros de digitação", input: "tem lampda" },
  { id: 102, group: "Erros de digitação", input: "tem dijuntor" },
  { id: 103, group: "Erros de digitação", input: "tem disjutor" },
  { id: 104, group: "Erros de digitação", input: "tem tomda" },
  { id: 105, group: "Erros de digitação", input: "tem refretor" },
  { id: 106, group: "Erros de digitação", input: "tem plafom" },

  // Infravermelho e termos técnicos
  { id: 130, group: "Infravermelho", input: "tem luz infravermelha?" },
  { id: 131, group: "Infravermelho", input: "vc tem luz infravermelha?" },
  { id: 132, group: "Infravermelho", input: "tem lampada ou luzinfravermelha?" },
  { id: 133, group: "Infravermelho", input: "o que e luz infravermelha?" },
  { id: 134, group: "Infravermelho", input: "tem sensor infravermelho?" },
  { id: 135, group: "Infravermelho", input: "tem sensor de presença?" },

  // Técnica iluminação
  { id: 160, group: "Técnica", input: "o que e luz quente?" },
  { id: 161, group: "Técnica", input: "o que e luz fria?" },
  { id: 162, group: "Técnica", input: "qual diferenca entre luz quente e fria?" },
  { id: 163, group: "Técnica", input: "o que e lumen?" },
  { id: 164, group: "Técnica", input: "o que significa kelvin?" },
  { id: 165, group: "Técnica", input: "essa lampada entrega quantos lumens?" },

  // Segurança elétrica
  { id: 190, group: "Segurança elétrica", input: "qual fio usar para chuveiro?" },
  { id: 191, group: "Segurança elétrica", input: "qual disjuntor para chuveiro?" },
  { id: 192, group: "Segurança elétrica", input: "tomada esquentando" },
  { id: 193, group: "Segurança elétrica", input: "fio derretendo" },
  { id: 194, group: "Segurança elétrica", input: "cheiro de queimado na tomada" },
  { id: 195, group: "Segurança elétrica", input: "levei choque na tomada" },

  // Loja
  { id: 220, group: "Loja", input: "onde fica a loja?" },
  { id: 221, group: "Loja", input: "qual endereco da Haja Luz?" },
  { id: 222, group: "Loja", input: "que horas abre?" },
  { id: 223, group: "Loja", input: "que horas sao?" },
  { id: 224, group: "Loja", input: "aceita pix?" },
  { id: 225, group: "Loja", input: "faz entrega?" },
  { id: 226, group: "Loja", input: "como funciona o carrinho?" },
  { id: 227, group: "Loja", input: "os produtos sao originais?" },

  // Nivano
  { id: 250, group: "Nivano", input: "quem fez o site?" },
  { id: 251, group: "Nivano", input: "quem criou essa ia?" },
  { id: 252, group: "Nivano", input: "quem desenvolveu esse chatbot?" },

  // Correções do usuário
  { id: 280, group: "Correção do usuário", input: "isso nao e lampada" },
  { id: 281, group: "Correção do usuário", input: "isso nao e fio" },
  { id: 282, group: "Correção do usuário", input: "nao e isso" },

  // Off-topic
  { id: 300, group: "Off-topic", input: "me ensina a investir em bitcoin hoje" },
  { id: 301, group: "Off-topic", input: "qual o melhor celular para comprar" }
];

const conversations: AuditConversation[] = [
  {
    id: 1,
    group: "Contexto lâmpadas",
    messages: [
      "me fala sobre as lampadas disponiveis",
      "tem mais lampadas melhores?",
      "isso nao e lampada"
    ]
  },
  {
    id: 2,
    group: "Contexto saudação/cortesia",
    messages: [
      "me fala sobre as lampadas disponiveis",
      "como esta?",
      "tudo bem?",
      "tem mais lampadas?"
    ]
  },
  {
    id: 3,
    group: "Contexto segurança elétrica",
    messages: [
      "preciso de fio para chuveiro",
      "5500w",
      "220v"
    ]
  },
  {
    id: 4,
    group: "Contexto recomendação",
    messages: [
      "quero uma lampada para quarto",
      "qual melhor?"
    ]
  },
  {
    id: 5,
    group: "Múltiplas entidades",
    messages: [
      "tem lampada ou luzinfravermelha?",
      "tem sensor infravermelho?"
    ]
  },
  {
    id: 6,
    group: "Orçamento",
    messages: [
      "quero fazer um orçamento",
      "2 lampadas e 10 metros de fio"
    ]
  }
];

function main() {
  const singleResults = singleQuestions.map(runSingleQuestion);
  const conversationResults = conversations.map(runConversation);

  const outputDir = path.resolve(__dirname, "audit-results");
  fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, "chat-audit-report.json");
  const txtPath = path.join(outputDir, "chat-audit-report.txt");

  fs.writeFileSync(jsonPath, JSON.stringify({ singleResults, conversationResults }, null, 2), "utf-8");
  fs.writeFileSync(txtPath, formatTextReport(singleResults, conversationResults), "utf-8");

  console.log("Auditoria concluída!");
  console.log(`Perguntas isoladas: ${singleResults.length}`);
  console.log(`Conversas: ${conversationResults.length}`);
  console.log(`Relatório TXT: ${txtPath}`);
  console.log(`Relatório JSON: ${jsonPath}`);
}

main();
