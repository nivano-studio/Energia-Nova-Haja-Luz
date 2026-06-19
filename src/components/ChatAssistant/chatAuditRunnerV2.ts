/// <reference types="node" />
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processQuery } from "./chatEngine";
import { resetChatContext } from "./chatContext";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AuditQuestion = {
  id: number;
  group: string;
  input: string;
  expectedIntent?: string;
  notes?: string;
};

type AuditConversation = {
  id: number;
  group: string;
  messages: string[];
  expectedFinalIntent?: string;
  notes?: string;
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
    type: a.type || "",
    payload: a.payload || {}
  }));
}

function runSingleQuestion(question: AuditQuestion) {
  resetChatContext?.();

  const response = processQuery(question.input);

  return {
    id: question.id,
    group: question.group,
    input: question.input,
    expectedIntent: question.expectedIntent || "",
    notes: question.notes || "",
    responseText: response.text || "",
    intent: response.intent || "",
    confidence: response.confidence ?? null,
    entities: response.entities || null,
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
      id: `${conversation.id}.${index + 1}`,
      group: conversation.group,
      input: message,
      responseText: response.text || "",
      intent: response.intent || "",
      confidence: response.confidence ?? null,
      entities: response.entities || null,
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
    expectedFinalIntent: conversation.expectedFinalIntent || "",
    notes: conversation.notes || "",
    turns,
    finalIntent: lastTurn?.intent || "",
    finalResponseText: lastTurn?.responseText || ""
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTextReport(singleResults: any[], conversationResults: any[]) {
  const lines: string[] = [];

  lines.push("RELATÓRIO DE AUDITORIA LOCAL V2 — IA HAJA LUZ");
  lines.push("Teste focado em erros de digitação, contexto, frases reais e falsos positivos");
  lines.push("=".repeat(90));
  lines.push("");
  lines.push("RESUMO");
  lines.push("-".repeat(90));
  lines.push(`Perguntas isoladas testadas: ${singleResults.length}`);
  lines.push(`Conversas testadas: ${conversationResults.length}`);
  lines.push("");

  lines.push("PERGUNTAS ISOLADAS");
  lines.push("=".repeat(90));

  for (const result of singleResults) {
    lines.push("");
    lines.push(`[${result.id}] Grupo: ${result.group}`);
    lines.push(`Pergunta: ${result.input}`);
    if (result.expectedIntent) lines.push(`Intent esperada: ${result.expectedIntent}`);
    if (result.notes) lines.push(`Observação: ${result.notes}`);
    lines.push(`Intent recebida: ${result.intent || "SEM INTENT"}`);
    lines.push(`Confidence: ${result.confidence ?? "SEM CONFIDENCE"}`);
    lines.push(`WhatsApp: ${result.whatsappBtn ? "Sim" : "Não"}`);

    if (result.entities) {
      lines.push("Entidades:");
      lines.push(JSON.stringify(result.entities, null, 2));
    }

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
        lines.push(`- ${action.label} | Tipo: ${action.type || "-"} | Payload: ${JSON.stringify(action.payload || {})}`);
      }
    }

    if (result.suggestedQuestions.length > 0) {
      lines.push("Sugestões:");
      for (const suggestion of result.suggestedQuestions) {
        lines.push(`- ${suggestion}`);
      }
    }

    if (result.debug) {
      lines.push("Debug:");
      lines.push(JSON.stringify(result.debug, null, 2));
    }

    lines.push("-".repeat(90));
  }

  lines.push("");
  lines.push("CONVERSAS COM CONTEXTO");
  lines.push("=".repeat(90));

  for (const conversation of conversationResults) {
    lines.push("");
    lines.push(`[CONVERSA ${conversation.id}] Grupo: ${conversation.group}`);
    lines.push(`Mensagens: ${conversation.messages.join(" -> ")}`);
    if (conversation.expectedFinalIntent) lines.push(`Intent final esperada: ${conversation.expectedFinalIntent}`);
    if (conversation.notes) lines.push(`Observação: ${conversation.notes}`);
    lines.push(`Intent final recebida: ${conversation.finalIntent || "SEM INTENT"}`);

    for (const turn of conversation.turns) {
      lines.push("");
      lines.push(`Usuário: ${turn.input}`);
      lines.push(`Intent: ${turn.intent || "SEM INTENT"}`);
      lines.push(`Confidence: ${turn.confidence ?? "SEM CONFIDENCE"}`);
      if (turn.entities) {
        lines.push("Entidades:");
        lines.push(JSON.stringify(turn.entities, null, 2));
      }
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
          lines.push(`- ${action.label} | Tipo: ${action.type || "-"} | Payload: ${JSON.stringify(action.payload || {})}`);
        }
      }

      if (turn.debug) {
        lines.push("Debug:");
        lines.push(JSON.stringify(turn.debug, null, 2));
      }
    }

    lines.push("-".repeat(90));
  }

  // --- ADVANCED REPORTS ---
  lines.push("");
  lines.push("RELATÓRIOS AVANÇADOS");
  lines.push("=".repeat(90));

  // 1. Confusion Report
  const confusionList = singleResults.filter(r => r.expectedIntent && r.expectedIntent !== r.intent);
  lines.push(`\n1. Confusion Report (Expected vs Received): ${confusionList.length} falhas`);
  confusionList.forEach(r => {
    lines.push(`   [ID ${r.id}] Esperava: '${r.expectedIntent}' | Recebeu: '${r.intent}'`);
  });

  // 2. Category Violation Report
  // (In a real scenario, we'd cross-check productTaxonomy, but here we flag any products that seem completely unrelated)
  let categoryViolations = 0;
  singleResults.forEach(r => {
    if (r.products && r.products.length > 0 && r.intent === "product_search") {
      const isLampSearch = (r.input.includes("lampada") || r.input.includes("luz")) && !r.input.includes("sensor");
      const hasWrongCategory = r.products.some((p: { category: string }) => isLampSearch && p.category !== "Iluminação" && p.category !== "iluminacao");
      if (hasWrongCategory) {
        categoryViolations++;
        lines.push(`   [ID ${r.id}] Category Violation! Busca por lâmpada retornou outras categorias.`);
      }
    }
  });
  lines.push(`\n2. Category Violation Report: ${categoryViolations} violações`);

  // 3. Price Violation Report
  const priceViolations = singleResults.filter(r => /R\$|\d+,\d{2}/.test(r.responseText));
  lines.push(`\n3. Price Violation Report: ${priceViolations.length} violações`);
  priceViolations.forEach(r => {
    lines.push(`   [ID ${r.id}] Preço numérico ou R$ vazado na resposta!`);
  });

  // 4. Fallback Report
  const fallbacks = singleResults.filter(r => r.intent === "fallback" || r.intent === "ask_disambiguation");
  lines.push(`\n4. Fallback Report: ${fallbacks.length} ocorrências`);
  fallbacks.forEach(r => {
    lines.push(`   [ID ${r.id}] Entrou em fallback/disambiguation: '${r.input}'`);
  });

  // 5. Low Confidence Report
  const lowConfidence = singleResults.filter(r => r.confidence !== null && r.confidence < 0.7);
  lines.push(`\n5. Low Confidence Report (< 0.7): ${lowConfidence.length} ocorrências`);
  lowConfidence.forEach(r => {
    lines.push(`   [ID ${r.id}] Confidence: ${r.confidence} | Input: '${r.input}'`);
  });

  // 6. Repeated Error Report (Termos mais problemáticos)
  const problematicTerms: Record<string, number> = {};
  [...confusionList, ...lowConfidence, ...fallbacks].forEach(r => {
    const words = r.input.split(' ').filter((w: string) => w.length > 3);
    words.forEach((w: string) => {
      problematicTerms[w] = (problematicTerms[w] || 0) + 1;
    });
  });
  const sortedTerms = Object.entries(problematicTerms).sort((a, b) => b[1] - a[1]).slice(0, 5);
  lines.push(`\n6. Repeated Error Report (Top Termos Problemáticos):`);
  sortedTerms.forEach(([term, count]) => {
    lines.push(`   - ${term}: ${count} ocorrências`);
  });

  lines.push("=".repeat(90));

  return lines.join("\n");
}

const singleQuestions: AuditQuestion[] = [
  // 1. Saudações e variações com erro
  { id: 1, group: "Saudações com erro", input: "oi", expectedIntent: "greeting" },
  { id: 2, group: "Saudações com erro", input: "oii", expectedIntent: "greeting" },
  { id: 3, group: "Saudações com erro", input: "oiii", expectedIntent: "greeting" },
  { id: 4, group: "Saudações com erro", input: "oire", expectedIntent: "greeting" },
  { id: 5, group: "Saudações com erro", input: "oie", expectedIntent: "greeting" },
  { id: 6, group: "Saudações com erro", input: "olaaa", expectedIntent: "greeting" },
  { id: 7, group: "Saudações com erro", input: "opaa", expectedIntent: "greeting" },
  { id: 8, group: "Saudações com erro", input: "eai", expectedIntent: "greeting" },
  { id: 9, group: "Saudações com erro", input: "eaee", expectedIntent: "greeting" },
  { id: 10, group: "Saudações com erro", input: "hello", expectedIntent: "greeting" },
  { id: 11, group: "Saudações com erro", input: "bomdia", expectedIntent: "greeting" },
  { id: 12, group: "Saudações com erro", input: "boanoite", expectedIntent: "greeting" },

  // 2. Cortesia e conversa social
  { id: 30, group: "Cortesia", input: "como esta?", expectedIntent: "courtesy" },
  { id: 31, group: "Cortesia", input: "como esta", expectedIntent: "courtesy" },
  { id: 32, group: "Cortesia", input: "como voce esta?", expectedIntent: "courtesy" },
  { id: 33, group: "Cortesia", input: "como vc ta?", expectedIntent: "courtesy" },
  { id: 34, group: "Cortesia", input: "tudo bem?", expectedIntent: "courtesy" },
  { id: 35, group: "Cortesia", input: "td bem", expectedIntent: "courtesy" },
  { id: 36, group: "Cortesia", input: "blz?", expectedIntent: "courtesy" },
  { id: 37, group: "Cortesia", input: "eai tudo bem", expectedIntent: "courtesy" },
  { id: 38, group: "Cortesia", input: "opa tudo certo", expectedIntent: "courtesy" },

  // 3. Abreviações com palavras antes/depois
  { id: 60, group: "Abreviações e compra", input: "vc tem fio", expectedIntent: "product_search" },
  { id: 61, group: "Abreviações e compra", input: "oi vc tem fio", expectedIntent: "product_search" },
  { id: 62, group: "Abreviações e compra", input: "bom dia vc tem fio ai?", expectedIntent: "product_search" },
  { id: 63, group: "Abreviações e compra", input: "vcs tem lampada?", expectedIntent: "product_search" },
  { id: 64, group: "Abreviações e compra", input: "vcs tem lanpada led?", expectedIntent: "product_search" },
  { id: 65, group: "Abreviações e compra", input: "ce tem tomada 20a?", expectedIntent: "product_search" },
  { id: 66, group: "Abreviações e compra", input: "qto custa lampada?", expectedIntent: "product_price" },
  { id: 67, group: "Abreviações e compra", input: "qual valor da tomada 20a?", expectedIntent: "product_price" },
  { id: 68, group: "Abreviações e compra", input: "oq e luz fria?", expectedIntent: "technical_explanation" },
  { id: 69, group: "Abreviações e compra", input: "tem zap?", expectedIntent: "human_support" },
  { id: 70, group: "Abreviações e compra", input: "manda wpp", expectedIntent: "human_support" },

  // 4. Erros de digitação em produtos
  { id: 100, group: "Erros de digitação", input: "tem lanpada", expectedIntent: "product_search" },
  { id: 101, group: "Erros de digitação", input: "tem lampda", expectedIntent: "product_search" },
  { id: 102, group: "Erros de digitação", input: "tem lampada ledd", expectedIntent: "product_search" },
  { id: 103, group: "Erros de digitação", input: "tem dijuntor", expectedIntent: "product_search" },
  { id: 104, group: "Erros de digitação", input: "tem disjutor", expectedIntent: "product_search" },
  { id: 105, group: "Erros de digitação", input: "tem tomda", expectedIntent: "product_search" },
  { id: 106, group: "Erros de digitação", input: "tem interrupto", expectedIntent: "product_search" },
  { id: 107, group: "Erros de digitação", input: "tem refretor", expectedIntent: "product_search" },
  { id: 108, group: "Erros de digitação", input: "tem plafom", expectedIntent: "product_search" },
  { id: 109, group: "Erros de digitação", input: "tem fiu", expectedIntent: "product_search" },
  { id: 110, group: "Erros de digitação", input: "tem cabu", expectedIntent: "product_search" },

  // 5. Produto + especificação, NÃO multiple_entities
  { id: 140, group: "Produto com especificação", input: "tem lampada led?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 141, group: "Produto com especificação", input: "tem lampada 9w?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 142, group: "Produto com especificação", input: "tem lampada 12w branca fria?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 143, group: "Produto com especificação", input: "tem tomada 20a?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 144, group: "Produto com especificação", input: "tem tomada 10a?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 145, group: "Produto com especificação", input: "tem disjuntor 32a?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 146, group: "Produto com especificação", input: "tem refletor 100w?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },
  { id: 147, group: "Produto com especificação", input: "tem sensor de presença?", expectedIntent: "product_search", notes: "Não pode ser multiple_entities" },

  // 6. Múltiplas entidades reais
  { id: 170, group: "Múltiplas entidades reais", input: "tem lampada e fio?", expectedIntent: "multiple_entities" },
  { id: 171, group: "Múltiplas entidades reais", input: "tem tomada e disjuntor?", expectedIntent: "multiple_entities" },
  { id: 172, group: "Múltiplas entidades reais", input: "quero lampada ou refletor", expectedIntent: "multiple_entities" },
  { id: 173, group: "Múltiplas entidades reais", input: "preciso de cabo tomada e disjuntor", expectedIntent: "multiple_entities" },
  { id: 174, group: "Múltiplas entidades reais", input: "tem lampada ou luzinfravermelha?", expectedIntent: "multi_entity_product_or_technical" },

  // 7. Lâmpadas e categoria
  { id: 200, group: "Busca por lâmpadas", input: "me fala sobre as lampadas disponiveis", expectedIntent: "product_search" },
  { id: 201, group: "Busca por lâmpadas", input: "quero ver lampadas", expectedIntent: "product_search" },
  { id: 202, group: "Busca por lâmpadas", input: "tem lampadas melhores?", expectedIntent: "product_recommendation" },
  { id: 203, group: "Busca por lâmpadas", input: "me mostra lampada branca fria", expectedIntent: "product_search" },
  { id: 204, group: "Busca por lâmpadas", input: "me mostra lampada luz quente", expectedIntent: "product_search" },

  // 8. Ver mais / continuação de busca
  { id: 230, group: "Ver mais isolado", input: "ver mais", expectedIntent: "show_more_results", notes: "Sem contexto, deve perguntar de qual categoria" },
  { id: 231, group: "Ver mais isolado", input: "tem mais", expectedIntent: "show_more_results", notes: "Sem contexto, deve perguntar de qual categoria" },
  { id: 232, group: "Ver mais isolado", input: "mais opções", expectedIntent: "show_more_results", notes: "Sem contexto, deve perguntar de qual categoria" },
  { id: 233, group: "Ver mais isolado", input: "tem mais lampadas?", expectedIntent: "show_more_results" },
  { id: 234, group: "Ver mais isolado", input: "quero ver mais fios", expectedIntent: "show_more_results" },

  // 9. Infravermelho e sensor
  { id: 260, group: "Infravermelho e sensor", input: "tem luz infravermelha?", expectedIntent: "product_or_technical_infrared" },
  { id: 261, group: "Infravermelho e sensor", input: "vc tem luz infravermelha?", expectedIntent: "product_or_technical_infrared" },
  { id: 262, group: "Infravermelho e sensor", input: "tem luzinfravermelha?", expectedIntent: "product_or_technical_infrared" },
  { id: 263, group: "Infravermelho e sensor", input: "o que e luz infravermelha?", expectedIntent: "technical_infrared" },
  { id: 264, group: "Infravermelho e sensor", input: "tem sensor infravermelho?", expectedIntent: "product_or_technical_infrared" },
  { id: 265, group: "Infravermelho e sensor", input: "tem sensor de presença?", expectedIntent: "product_search" },
  { id: 266, group: "Infravermelho e sensor", input: "sensor para acender luz automaticamente", expectedIntent: "product_search" },

  // 10. Técnica / especificações
  { id: 300, group: "Técnica", input: "o que e luz quente?", expectedIntent: "technical_explanation" },
  { id: 301, group: "Técnica", input: "o que e luz fria?", expectedIntent: "technical_explanation" },
  { id: 302, group: "Técnica", input: "qual diferenca entre luz quente e fria?", expectedIntent: "technical_explanation" },
  { id: 303, group: "Técnica", input: "o que e lumen?", expectedIntent: "technical_explanation" },
  { id: 304, group: "Técnica", input: "o que significa kelvin?", expectedIntent: "technical_explanation" },
  { id: 305, group: "Técnica", input: "essa lampada entrega quantos lumens?", expectedIntent: "product_spec_question" },
  { id: 306, group: "Técnica", input: "essa lampada tem quantos watts?", expectedIntent: "product_spec_question" },
  { id: 307, group: "Técnica", input: "qual kelvin dessa lampada?", expectedIntent: "product_spec_question" },

  // 11. Segurança elétrica
  { id: 340, group: "Segurança elétrica", input: "qual fio usar para chuveiro?", expectedIntent: "safety_guided" },
  { id: 341, group: "Segurança elétrica", input: "qual disjuntor para chuveiro?", expectedIntent: "safety_guided" },
  { id: 342, group: "Segurança elétrica", input: "tomada esquentando", expectedIntent: "safety_urgent" },
  { id: 343, group: "Segurança elétrica", input: "fio derretendo", expectedIntent: "safety_urgent" },
  { id: 344, group: "Segurança elétrica", input: "cheiro de queimado na tomada", expectedIntent: "safety_urgent" },
  { id: 345, group: "Segurança elétrica", input: "levei choque na tomada", expectedIntent: "safety_urgent" },
  { id: 346, group: "Segurança elétrica", input: "disjuntor caindo toda hora", expectedIntent: "safety_urgent" },

  // 12. Loja / FAQ
  { id: 380, group: "FAQ Loja", input: "como funciona o carrinho?", expectedIntent: "cart_or_quote_info" },
  { id: 381, group: "FAQ Loja", input: "como faço orçamento pelo carrinho?", expectedIntent: "cart_or_quote_info" },
  { id: 382, group: "FAQ Loja", input: "os produtos sao originais?", expectedIntent: "warranty_original_products" },
  { id: 383, group: "FAQ Loja", input: "tem garantia?", expectedIntent: "warranty_original_products" },
  { id: 384, group: "FAQ Loja", input: "vem com nota fiscal?", expectedIntent: "warranty_original_products" },
  { id: 385, group: "FAQ Loja", input: "onde fica a loja?", expectedIntent: "store_location" },
  { id: 386, group: "FAQ Loja", input: "qual endereco da Haja Luz?", expectedIntent: "store_location" },
  { id: 387, group: "FAQ Loja", input: "que horas abre?", expectedIntent: "store_hours" },
  { id: 388, group: "FAQ Loja", input: "que horas sao?", expectedIntent: "real_time" },
  { id: 389, group: "FAQ Loja", input: "aceita pix?", expectedIntent: "payment" },
  { id: 390, group: "FAQ Loja", input: "faz entrega?", expectedIntent: "delivery" },

  // 13. Nivano / desenvolvedor
  { id: 420, group: "Nivano", input: "quem fez o site?", expectedIntent: "developer_credit" },
  { id: 421, group: "Nivano", input: "quem criou essa ia?", expectedIntent: "developer_credit" },
  { id: 422, group: "Nivano", input: "quem desenvolveu esse chatbot?", expectedIntent: "developer_credit" },
  { id: 423, group: "Nivano", input: "quem programou esse sistema?", expectedIntent: "developer_credit" },
  { id: 424, group: "Nivano", input: "quem fez a ia de atendimento?", expectedIntent: "developer_credit" },

  // 14. Correções do usuário
  { id: 450, group: "Correção", input: "isso nao e lampada", expectedIntent: "correction_wrong_result" },
  { id: 451, group: "Correção", input: "isso nao e fio", expectedIntent: "correction_wrong_result" },
  { id: 452, group: "Correção", input: "nao e isso", expectedIntent: "correction_wrong_result" },
  { id: 453, group: "Correção", input: "produto errado", expectedIntent: "correction_wrong_result" },
  { id: 454, group: "Correção", input: "voce errou", expectedIntent: "correction_wrong_result" },

  // 15. Atendimento humano
  { id: 480, group: "Atendimento humano", input: "quero falar com atendente", expectedIntent: "human_support" },
  { id: 481, group: "Atendimento humano", input: "manda o zap", expectedIntent: "human_support" },
  { id: 482, group: "Atendimento humano", input: "tem whatsapp?", expectedIntent: "human_support" },
  { id: 483, group: "Atendimento humano", input: "quero suporte", expectedIntent: "human_support" },
  { id: 484, group: "Atendimento humano", input: "tem suporte para lampada?", expectedIntent: "product_search", notes: "Suporte + produto deve ser produto, não atendimento" },

  // 16. Off-topic / falsos positivos
  { id: 520, group: "Off-topic", input: "me ensina a investir em bitcoin hoje", expectedIntent: "off_topic" },
  { id: 521, group: "Off-topic", input: "qual o melhor celular para comprar", expectedIntent: "off_topic" },
  { id: 522, group: "Off-topic", input: "me faz uma receita de bolo", expectedIntent: "off_topic" },
  { id: 523, group: "Off-topic", input: "quem ganhou o jogo ontem", expectedIntent: "off_topic" },
  { id: 524, group: "Off-topic", input: "qual melhor iphone", expectedIntent: "off_topic" },

  // 17. Frases bagunçadas reais
  { id: 560, group: "Frases reais bagunçadas", input: "bom dia amigo vc tem lampada led 12w ai?", expectedIntent: "product_search" },
  { id: 561, group: "Frases reais bagunçadas", input: "opa, qto ta a tomada 20a branca?", expectedIntent: "product_price" },

  // --- V7.2 BUGS REAIS CHAT ---
  { id: 601, group: "Bugs Reais (V7.2)", input: "como voceesta?", expectedIntent: "courtesy" },
  { id: 602, group: "Bugs Reais (V7.2)", input: "como voce esta?", expectedIntent: "courtesy" },
  { id: 603, group: "Bugs Reais (V7.2)", input: "qual as melhores lampadas?", expectedIntent: "product_recommendation" },
  { id: 604, group: "Bugs Reais (V7.2)", input: "lampadas?", expectedIntent: "product_search" },
  { id: 605, group: "Bugs Reais (V7.2)", input: "luz", expectedIntent: "ask_disambiguation" },

  { id: 562, group: "Frases reais bagunçadas", input: "eai vcs trabalha com fio 2.5mm?", expectedIntent: "product_search" },
  { id: 563, group: "Frases reais bagunçadas", input: "boa tarde tem disjuntor 32a ou 40a?", expectedIntent: "product_search" },
  { id: 564, group: "Frases reais bagunçadas", input: "me ve uma lampada boa pra quarto", expectedIntent: "product_recommendation" },
  { id: 565, group: "Frases reais bagunçadas", input: "preciso de luz pra cozinha qual recomenda", expectedIntent: "product_recommendation" },
  { id: 566, group: "Frases reais bagunçadas", input: "tem coisa pra instalar ventilador de teto?", expectedIntent: "product_search" },

  // --- V11 NOVOS CENÁRIOS OBRIGATÓRIOS ---
  { id: 700, group: "V11: Parafuso", input: "tem parafuso?", expectedIntent: "product_search", notes: "Must return Ferragens e Fixação" },
  { id: 701, group: "V11: Reclamação", input: "cade as lampadas q nao achei", expectedIntent: "missing_product_complaint" },
  { id: 702, group: "V11: Saudações com ruído", input: "oi mn td bom", expectedIntent: "courtesy" },
  { id: 703, group: "V11: Palavra errada", input: "tem shuveiro", expectedIntent: "product_search" },
  { id: 704, group: "V11: Data atual", input: "que dia e hoje?", expectedIntent: "current_date" }
];

const conversations: AuditConversation[] = [
  {
    id: 1,
    group: "Contexto lâmpadas e ver mais",
    expectedFinalIntent: "correction_wrong_result",
    messages: [
      "me fala sobre as lampadas disponiveis",
      "tem mais lampadas melhores?",
      "isso nao e lampada"
    ],
    notes: "Não pode retornar ferramenta, disjuntor, centro de distribuição ou esquadro."
  },
  {
    id: 2,
    group: "Contexto cortesia não pode quebrar busca",
    expectedFinalIntent: "show_more_results",
    messages: [
      "me fala sobre as lampadas disponiveis",
      "como esta?",
      "tudo bem?",
      "tem mais lampadas?"
    ],
    notes: "Como está deve ser cortesia, mas não deve apagar lastSearch de lâmpadas."
  },
  {
    id: 3,
    group: "Contexto segurança elétrica",
    expectedFinalIntent: "safety_guided",
    messages: [
      "preciso de fio para chuveiro",
      "5500w",
      "220v"
    ],
    notes: "220v não pode virar product_search nem retornar chave teste, relé, refletor."
  },
  {
    id: 4,
    group: "Contexto recomendação de lâmpada",
    expectedFinalIntent: "context_product_recommendation",
    messages: [
      "quero uma lampada para quarto",
      "qual melhor?"
    ],
    notes: "A IA deve lembrar que o ambiente é quarto."
  },
  {
    id: 5,
    group: "Múltiplas entidades e infravermelho",
    expectedFinalIntent: "product_or_technical_infrared",
    messages: [
      "tem lampada ou luzinfravermelha?",
      "tem sensor infravermelho?"
    ],
    notes: "Deve falar de lâmpada e infravermelho, depois sensor."
  },
  {
    id: 6,
    group: "Orçamento simples",
    expectedFinalIntent: "quote_item",
    messages: [
      "quero fazer um orçamento",
      "2 lampadas e 10 metros de fio"
    ],
    notes: "Não deve retornar fita LED ou corrugado como produto principal; deve montar lista."
  },
  {
    id: 7,
    group: "Orçamento com várias linhas",
    expectedFinalIntent: "quote_item",
    messages: [
      "quero cotar uns materiais",
      "3 tomadas 20a",
      "2 disjuntores 32a",
      "1 rolo de fio 2.5"
    ],
    notes: "Deve acumular itens no orçamento."
  },
  {
    id: 8,
    group: "Produto + preço + mais opções",
    expectedFinalIntent: "show_more_results",
    messages: [
      "qto custa lampada",
      "tem mais baratas?",
      "quero ver mais"
    ],
    notes: "Deve manter contexto de lâmpadas."
  },
  {
    id: 9,
    group: "Falso positivo de suporte",
    expectedFinalIntent: "human_support",
    messages: [
      "tem suporte para lampada?",
      "quero falar com suporte"
    ],
    notes: "Primeira frase é produto; segunda é atendimento."
  },
  {
    id: 10,
    group: "Produto solto e complemento",
    expectedFinalIntent: "product_search",
    messages: [
      "tomada",
      "20a",
      "branca"
    ],
    notes: "Deve usar contexto de tomada e atributos 20A/branca."
  }
];

function main() {
  const singleResults = singleQuestions.map(runSingleQuestion);
  const conversationResults = conversations.map(runConversation);

  const outputDir = path.resolve(__dirname, "audit-results");
  fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, "chat-audit-v2-report.json");
  const txtPath = path.join(outputDir, "chat-audit-v2-report.txt");

  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ singleResults, conversationResults }, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    txtPath,
    formatTextReport(singleResults, conversationResults),
    "utf-8"
  );

  console.log("Auditoria V2 concluída!");
  console.log(`Perguntas isoladas: ${singleResults.length}`);
  console.log(`Conversas: ${conversationResults.length}`);
  console.log(`Relatório TXT: ${txtPath}`);
  console.log(`Relatório JSON: ${jsonPath}`);
}

main();
