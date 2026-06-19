import type { ExtractedEntities } from './types';
import { hasTrueMultipleEntities } from './chatEntities';
import { 
  v15Farewells, 
  v15Price, 
  v15Quote, 
  v15Recommendation, 
  v15Technical
} from './knowledge/v15Dictionaries';
import {
  v12DateTime, v12Developer, v12Social, v12StoreFaq
} from './knowledge/v12Dictionaries';
import { strongOffTopicTerms } from './chatDictionaries';
import { ambiguousTerms } from './chatIntents';

export interface IntentScore {
  intent: string;
  score: number;
  confidence: number;
  reasons: string[];
}

function isLaughter(text: string): boolean {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  if (!normalized) return false;
  if (/^k+$/.test(normalized)) return true;
  if (/^(rs)+r?$/.test(normalized)) return true;
  if (/^(ha)+h?$/.test(normalized)) return true;
  if (/^(he)+h?$/.test(normalized)) return true;
  if (/^(kk?a)+k?$/.test(normalized)) return true;
  if (/^(hu[eh]u[eh])+$/.test(normalized)) return true;
  return false;
}

function hasWholePhrase(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
}

export function calculateAdvancedIntentScores(
  text: string,
  entities?: ExtractedEntities,
  contextStrength: 'none' | 'weak' | 'medium' | 'strong' = 'none'
): IntentScore[] {
  const scores: Omit<IntentScore, 'confidence'>[] = [];
  
  // Check for laughter first
  if (isLaughter(text)) {
    scores.push({ intent: "courtesy", score: 150, reasons: ["Risada detectada (+150)"] });
    return scores.map(s => ({ ...s, confidence: 1.0 })) as any;
  }

  const words = text.split(/\s+/);
  
  const hasProd = entities?.products && entities.products.length > 0;
  const hasCat = entities?.category !== undefined;
  const hasEnv = entities?.environment !== undefined;
  const hasTechAttr = (entities?.voltage !== undefined || entities?.powerWatts !== undefined || entities?.currentAmps !== undefined) && words.length <= 3;
  const hasContext = contextStrength !== 'none';
  const isContextMediumOrStrong = contextStrength === 'medium' || contextStrength === 'strong';
  const localOffTopicKeywords = ["celular", "iphone", "smartphone", "televisao", "notebook", "tablet", "geladeira", "fogao", "microondas", "computador"];
  const isOffTopicKeyword = strongOffTopicTerms.some(t => text.includes(t)) || localOffTopicKeywords.some(t => text.includes(t));
  
  const supportTriggers = ["atendente", "vendedor", "humano", "falar com atendente", "falar com vendedor", "whatsapp", "zap", "wpp", "telefone", "contato", "manda o zap", "tem zap", "passa contato"];
  const isHumanSupport = supportTriggers.some(p => text.includes(p)) || (text.includes("suporte") && !text.includes("lampada") && !text.includes("parede") && !text.includes("refletor"));

  // 1. product_search
  let psScore = 0;
  const psReasons: string[] = [];
  
  const searchVerbs = ["tem", "vende", "procuro", "quero", "queria", "arruma", "consegue", "preciso", "comprar", "busca"];
  const hasSearchVerb = searchVerbs.some(v => words.includes(v) || text.startsWith(v));
  
  if (hasProd) { 
    psScore += 50; 
    psReasons.push("Produto detectado (+50)");
    if (hasContext) {
      psScore += 60; // Produto novo forte vence contexto
      psReasons.push("Produto forte ignora/domina contexto (+60)");
    }
    if (hasSearchVerb) {
      psScore += 25;
      psReasons.push("Verbo de busca com produto (+25)");
    }
  }
  if (hasCat) { psScore += 20; psReasons.push("Categoria detectada (+20)"); }
  if (hasContext && !hasProd && hasCat) { psScore += 20; psReasons.push("Contexto de produto (+20)"); }
  if (hasContext && !hasProd && hasTechAttr) { psScore += 65; psReasons.push("Atributo técnico isolado em contexto (+65)"); }
  if (hasProd && (entities?.type || entities?.color)) { psScore += 30; psReasons.push("Produto com atributo (+30)"); }
  
  const moreOptionsTriggers = ["ver mais", "tem mais", "mais opcoes", "mais opções", "outras opcoes", "outros modelos", "quero ver mais", "tem mais alguma"];
  if (hasContext && moreOptionsTriggers.some(t => text.includes(t))) {
    psScore += 100; psReasons.push("Solicitação de mais opções em contexto (+100)");
  }

  if (isOffTopicKeyword) { psScore -= 200; psReasons.push("Termo off-topic forte (-200)"); }
  if (psScore > 0) scores.push({ intent: "product_search", score: psScore, reasons: psReasons });

  // 1.1 attribute_refinement
  if (entities?.hasIsolatedAttribute && isContextMediumOrStrong) {
    let arScore = 150;
    if (contextStrength === 'strong') arScore += 50;
    scores.push({ intent: "attribute_refinement", score: arScore, reasons: [`Atributo isolado com contexto ${contextStrength} (+${arScore})`] });
  }

  // 1.2 product_not_found
  const availabilityTriggers = ["tem", "vende", "procuro", "quero", "queria", "arruma", "consegue"];
  const hasAvailabilityVerb = availabilityTriggers.some(v => text.split(/\s+/).includes(v) || text.startsWith(v));
  const isOffTopic = isOffTopicKeyword;
  const isMoreOptions = moreOptionsTriggers.some(t => text.includes(t));
  const isFaqKeyword = [
    "garantia", "entrega", "carrinho", "pagamento", "endereco", "endereço", 
    "horario", "horário", "funciona", "localizacao", "localização", "onde fica", 
    "instagram", "insta", "rede social", "redes sociais", "original", "originais", 
    "nota fiscal", "nf", "compras", "compra", "orcamento", "orçamento", "cotacao", 
    "cotação", "como funciona", "que horas"
  ].some(kw => text.includes(kw));
  let isProductNotFound = false;

  if (!hasProd && !hasCat && !hasEnv && !entities?.hasIsolatedAttribute && hasAvailabilityVerb && words.length >= 2 && words.length <= 6 && !isOffTopic && !isMoreOptions && !isHumanSupport && !isFaqKeyword) {
    isProductNotFound = true;
    scores.push({ intent: "product_not_found", score: 150, reasons: ["Verbo de disponibilidade sem produto reconhecido (+150)"] });
  }

  // 1.3 product_search_with_nearest_match
  if (hasProd && entities?.products?.includes("cabo") && entities?.type === "2mm") {
    scores.push({ intent: "product_search_with_nearest_match", score: 200, reasons: ["Busca por cabo 2mm exato (+200)"] });
  }

  // 2. product_price
  let ppScore = 0;
  const ppReasons: string[] = [];
  if (!isProductNotFound) { // Only score price if it's not a missing product
    const hasPriceSignal = (v15Price && v15Price.some(p => text.includes(p))) || (v15Quote && v15Quote.some(p => text.includes(p)));
    if (hasPriceSignal) {
      if (v15Price && v15Price.some(p => text.includes(p))) { ppScore += 80; ppReasons.push("Padrão de preço V15 (+80)"); }
      if (v15Quote && v15Quote.some(p => text.includes(p))) { ppScore += 80; ppReasons.push("Padrão de orçamento V15 (+80)"); }
      if (hasProd || hasContext) { 
        ppScore += 50; ppReasons.push("Produto ou contexto (+50)"); 
        if (hasContext && !hasProd && hasTechAttr) {
          ppScore += 15; ppReasons.push("Atributo técnico isolado em contexto (+15)");
        }
      }
    }
    if (ppScore > 0) scores.push({ intent: "product_price", score: ppScore, reasons: ppReasons });
  }

  // 3. product_recommendation
  let prScore = 0;
  const prReasons: string[] = [];
  if (v15Recommendation && v15Recommendation.some(p => text.includes(p))) { prScore += 80; prReasons.push("Padrão de recomendação V15 (+80)"); }
  if (hasProd || hasCat) { prScore += 50; prReasons.push("Produto ou categoria (+50)"); }
  if (hasEnv) { prScore += 40; prReasons.push("Ambiente (+40)"); }
  if (isOffTopicKeyword) { prScore -= 200; prReasons.push("Termo off-topic forte (-200)"); }
  if (prScore > 0) scores.push({ intent: "product_recommendation", score: prScore, reasons: prReasons });

  // 4. product_spec_question
  let psqScore = 0;
  const psqReasons: string[] = [];
  const specPatterns = ["quantos lumens", "quanto lumens", "quantos watts", "quanto watts", "qual kelvin", "ficha tecnica", "potencia", "voltagem"];
  if (specPatterns.some(p => text.includes(p))) { psqScore += 80; psqReasons.push("Especificação técnica (+80)"); }
  if (hasProd || hasContext) { psqScore += 50; psqReasons.push("Produto ou contexto (+50)"); }
  if (psqScore > 0) scores.push({ intent: "product_spec_question", score: psqScore, reasons: psqReasons });

  // 5. courtesy & greetings
  let cScore = 0;
  const cReasons: string[] = [];
  let gScore = 0;
  const gReasons: string[] = [];
  
  const greetingTriggers = ["oi", "oie", "oii", "oiii", "ola", "olá", "olaaa", "opa", "opaa", "eai", "eaee", "hello", "bom dia", "boa tarde", "boa noite", "bomdia", "boanoite"];
  const courtesyTriggers = ["tudo bem", "tudo bom", "td bem", "blz", "beleza", "como vai", "como esta", "como vc ta", "como voce esta", "como voce ta", "tudo certo", "tudo ok", "td certo", "td ok"];
  
  if (courtesyTriggers.some(c => hasWholePhrase(text, c))) {
    if (words.length <= 4 && !hasProd) { cScore += 155; cReasons.push("Cortesia padrão (+155)"); }
  }
  if (greetingTriggers.some(g => hasWholePhrase(text, g))) {
    if (words.length <= 4 && !hasProd) { gScore += 150; gReasons.push("Saudação padrão (+150)"); }
  }
  if (cScore > 0) scores.push({ intent: "courtesy", score: cScore, reasons: cReasons });
  if (gScore > 0) scores.push({ intent: "greeting", score: gScore, reasons: gReasons });

  // 6. farewells
  if (v15Farewells && v15Farewells.some(f => {
    if (f.length <= 4) {
      return hasWholePhrase(text, f);
    }
    return text.includes(f);
  })) {
    scores.push({ intent: "farewell", score: 90, reasons: ["Despedida V15 (+90)"] });
  }

  // 7. developer_credit
  if (v12Developer && v12Developer.some(c => text.includes(c)) || text.includes("desenvolveu") && text.includes("chatbot")) {
    scores.push({ intent: "developer_credit", score: 100, reasons: ["Créditos do dev V12 (+100)"] });
  }

  // 8. social_instagram
  if (v12Social && v12Social.some(s => {
    if (s.length <= 5) {
      return new RegExp(`\\b${s}\\b`, 'i').test(text);
    }
    return text.includes(s);
  })) {
    scores.push({ intent: "store_location", score: 100, reasons: ["Social Instagram V12 (+100)"] }); 
  }

  // 9. off_topic
  let otScore = 0;
  const otReasons: string[] = [];
  if (isOffTopicKeyword && !hasProd) {
    otScore += 200; otReasons.push("Termo off-topic forte sem produto (+200)");
  }
  if (otScore > 0) scores.push({ intent: "off_topic", score: otScore, reasons: otReasons });

  // 10. technical_explanation
  let explScore = 0;
  const explReasons: string[] = [];
  if (v15Technical && v15Technical.some(p => text.includes(p))) { explScore += 120; explReasons.push("Pergunta técnica V15 (+120)"); }
  if (explScore > 0) scores.push({ intent: "technical_explanation", score: explScore, reasons: explReasons });

  // 11. FAQ / Store Info (Granular)
  if (["onde fica", "endereco", "localizacao", "chegar", "rota", "bairro"].some(kw => text.includes(kw)) || /\brua\b/i.test(text)) {
    scores.push({ intent: "store_location", score: 85, reasons: ["FAQ Loja (+85)"] });
  } else if (text.includes("horario") || text.includes("abre")) {
    scores.push({ intent: "store_hours", score: 85, reasons: ["FAQ Loja (+85)"] });
  } else if (text.includes("pagamento") || text.includes("parcela") || /\bpix\b/i.test(text)) {
    scores.push({ intent: "payment", score: 85, reasons: ["FAQ Loja (+85)"] });
  } else if (text.includes("entrega") || text.includes("frete") || text.includes("envia")) {
    scores.push({ intent: "delivery", score: 85, reasons: ["FAQ Loja (+85)"] });
  } else if (text.includes("garantia") || text.includes("defeito") || text.includes("troca") || text.includes("nota fiscal") || text.includes("original") || text.includes("originais")) {
    scores.push({ intent: "warranty_original_products", score: 85, reasons: ["FAQ Loja (+85)"] });
  } else if (text.includes("carrinho") || (/\bcompras?\b/i.test(text) && !text.includes("comprar"))) {
    const cartScore = text.includes("carrinho") ? 125 : 85;
    scores.push({ intent: "cart_or_quote_info", score: cartScore, reasons: ["FAQ Loja (+85)"] });
  } else if (v12StoreFaq && v12StoreFaq.some(kw => {
    if (kw.length <= 5) {
      return hasWholePhrase(text, kw);
    }
    return text.includes(kw);
  })) {
    scores.push({ intent: "warranty_original_products", score: 85, reasons: ["FAQ Loja V12 (+85)"] });
  }

  // 12. human_support
  if (isHumanSupport) {
    scores.push({ intent: "human_support", score: 90, reasons: ["Suporte humano padrão (+90)"] });
  }

  // 13. Ask Disambiguation
  if (Object.keys(ambiguousTerms).some(term => text === term || text === `${term}?`)) {
    scores.push({ intent: "ask_disambiguation", score: 110, reasons: ["Termo ambíguo isolado (+110)"] });
  }

  // 14. complaint_correction
  let mpcScore = 0;
  const mpcReasons: string[] = [];
  const complaintTriggers = ["cade as", "cade os", "nao achei", "nao encontrei", "nao tem"];
  const correctionTriggers = [
    "nao e isso", "produto errado", "voce errou", "isso nao e", "errado",
    "nao sao essas", "nao sao esses", "nao era isso", "nao sao estes",
    "nao e nada disso", "nao e esse", "nao e essa", "nao sao os que", "nao sao as que",
    "nada a ver"
  ];
  if (complaintTriggers.some(p => text.includes(p))) {
    mpcScore += 120; mpcReasons.push("Reclamação padrão (+120)");
  }
  if (mpcScore > 0) scores.push({ intent: "missing_product_complaint", score: mpcScore, reasons: mpcReasons });

  let cwrScore = 0;
  const cwrReasons: string[] = [];
  if (correctionTriggers.some(p => text.includes(p))) {
    cwrScore += 120; cwrReasons.push("Correção padrão (+120)");
  }
  if (cwrScore > 0) scores.push({ intent: "correction_wrong_result", score: cwrScore, reasons: cwrReasons });

  // 15. show_more_results
  let smrScore = 0;
  const smrReasons: string[] = [];
  const smrTriggers = ["ver mais", "tem mais", "mais opcoes", "mais opções", "mais resultados", "mais modelos"];
  if (smrTriggers.some(p => text.includes(p))) {
    smrScore += 120; smrReasons.push("Ver mais padrão (+120)");
  }
  if (smrScore > 0) scores.push({ intent: "show_more_results", score: smrScore, reasons: smrReasons });

  // 16. repair_context_clarification
  if (hasContext && words.length <= 3 && hasProd) {
    scores.push({ intent: "repair_context_clarification", score: 60, reasons: ["Resposta curta com produto (clarificação) (+60)"] });
  }

  // 16. current_date
  const isStoreHoursQuery = ["horario", "abre", "fecha", "funcionamento"].some(kw => text.includes(kw));
  if (!isStoreHoursQuery && v12DateTime && v12DateTime.some(d => text.includes(d))) {
    if (["dia", "hoje", "data"].some(d => text.includes(d))) {
      scores.push({ intent: "current_date", score: 100, reasons: ["Pergunta sobre a data V12 (+100)"] });
    } else {
      scores.push({ intent: "real_time", score: 100, reasons: ["Pergunta sobre a hora real V12 (+100)"] });
    }
  }

  // 17. product_or_technical_infrared
  if (text.includes("infravermelh") && !text.includes("serve") && !text.includes("o que e") && !text.includes("oq e") && !text.includes("diferenca")) {
    if (text.includes("luz") || hasProd) {
      scores.push({ intent: "product_or_technical_infrared", score: 180, reasons: ["Menção a infravermelho com contexto de produto (+180)"] });
    } else {
      scores.push({ intent: "product_or_technical_infrared", score: 180, reasons: ["Menção a infravermelho (+180)"] });
    }
  }

  // 18. technical_infrared
  if (text.includes("infravermelh") && (text.includes("serve") || text.includes("o que e") || text.includes("oq e") || text.includes("diferenca"))) {
    scores.push({ intent: "technical_infrared", score: 180, reasons: ["Dúvida técnica sobre infravermelho (+180)"] });
  }

  // 19. quote_start
  if (["orcamento", "cotacao", "quero cotar"].some(kw => text.includes(kw)) && !text.includes("carrinho")) {
    scores.push({ intent: "quote_start", score: 120, reasons: ["Solicitação de orçamento (+120)"] });
  }

  // 20. multiple_entities
  if (entities?.products && hasTrueMultipleEntities(entities, text)) {
    const queryPart = text.split('|')[0].trim();
    if (/\b(?:e|ou|,)\b/.test(queryPart)) {
      scores.push({ intent: "multiple_entities", score: 130, reasons: ["Múltiplos produtos detectados com conectores (+130)"] });
    } else {
      scores.push({ intent: "multiple_entities", score: 110, reasons: ["Múltiplos produtos detectados sem conectores claros (+110)"] });
    }
  }

  // 21. multi_entity_product_or_technical
  if (text.includes("infravermelh") && entities?.products && entities.products.length > 1) {
    scores.push({ intent: "multi_entity_product_or_technical", score: 190, reasons: ["Múltiplos produtos com infravermelho (+190)"] });
  }

  // Calculate confidence and sort
  const scoredIntents = scores.map(s => {
    let confidence = Math.min(1, s.score / 100);
    if (words.length <= 3 && Object.keys(ambiguousTerms).some(t => text.includes(t)) && s.score < 100) {
      confidence -= 0.2;
    }
    if (hasContext && s.intent !== "off_topic") {
      confidence += 0.1;
    }
    confidence = Math.max(0, Math.min(1, confidence));
    return { ...s, confidence };
  });

  return scoredIntents.sort((a, b) => b.score - a.score);
}
