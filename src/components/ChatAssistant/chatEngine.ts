import type { ChatResponse, ExtractedEntities, ChatAction, UnderstandingResult, IntentScore } from './types';
import type { Product } from '../../data/products';
import { preprocessMessage, normalizeText } from './chatPreprocess';
import { extractEntities } from './chatEntities';
import { checkContextDecision, chatContext, activateHardContext, clearHardContext, incrementSearchOffset, checkContextExpiration, updateContext, updateLastSearch, getContextStrength } from './chatContext';
import { searchProducts } from './chatProductSearch';
import { evaluateElectricalSafety } from './chatSafety';
import { responses } from './chatResponses';
import * as Intents from './chatIntents';
import { calculateAdvancedIntentScores } from './chatIntentScorer';
import { validateResponseBeforeReturn } from './chatValidator';
import { logInteraction } from './chatLogger';
import { storeInfo } from './knowledge/storeInfo';
import { electricalGlossary } from './knowledge/electricalGlossary';
import { faqKnowledge } from './knowledge/faqKnowledge';
import { productAndTechnicalKeywords, synonyms } from './chatDictionaries';

function isProductOrCategory(word: string): boolean {
  if (!word) return false;
  const normalized = word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  if (productAndTechnicalKeywords.includes(normalized)) return true;
  
  if (synonyms[normalized]) return true;
  for (const synList of Object.values(synonyms)) {
    if (synList.includes(normalized)) return true;
  }
  
  const commonProducts = ["lampada", "fio", "cabo", "tomada", "interruptor", "disjuntor", "refletor", "plafon", "sensor", "ventilador", "ferramenta", "luminaria", "chuveiro"];
  if (commonProducts.includes(normalized)) return true;
  if (commonProducts.some(p => normalized === p + "s" || normalized === p + "es")) return true;
  
  return false;
}

// validateResponseBeforeReturn is now imported from chatValidator.ts

function calculateConfidence(bestScore: number, clean: string, isContextual: boolean, hasProd: boolean = false): number {
  let confidence = Math.min(1.0, bestScore / 100);

  if (hasProd) {
    confidence = Math.max(confidence, 0.85);
  }

  if (isContextual) confidence += 0.1;

  // Penalties for ambiguous terms - only if clean query is short (3 words or fewer)
  if (clean.split(/\s+/).length <= 3) {
    for (const [term] of Object.entries(Intents.ambiguousTerms)) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(clean)) {
        if (term === "suporte" && clean.includes("para lampada")) continue;
        confidence -= 0.2;
      }
    }
  }

  return Math.max(0.1, Math.min(1.0, confidence));
}

function handleAmbiguousTerms(clean: string): ChatResponse | null {
  const commerceVerbs = ["tem", "vende", "quero", "preciso", "comprar", "busca", "procuro"];
  if (commerceVerbs.some(v => new RegExp(`\\b${v}\\b`, 'i').test(clean))) {
    return null;
  }
  for (const [term] of Object.entries(Intents.ambiguousTerms)) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(clean) && clean.split(' ').length <= 3) {
      // Ignore disambiguation if the text is clearly unambiguous
      if (term === "suporte" && clean.includes("para lampada")) continue;

      // If it's short and ambiguous
      if (term === "luz") {
        if (clean.includes("fria") || clean.includes("quente") || clean.includes("neutra") || clean.includes("infravermelh") || clean.includes("ultravioleta") || clean.includes("emergencia")) continue;
        return { text: responses.ambiguousShortQueryLuz, intent: "ambiguous_short_query", confidence: 1.0 };
      }
      if (term === "chave") return { text: "Você procura chave como ferramenta, chave disjuntora ou interruptor?", intent: "ambiguous_short_query", confidence: 1.0 };
      if (term === "suporte") return { text: "Você precisa de suporte de atendimento ou de um suporte físico/peça?", intent: "ambiguous_short_query", confidence: 1.0 };
      if (term === "cabo" || term === "fio") return { text: responses.ambiguousShortQueryFio, intent: "ambiguous_short_query", confidence: 1.0 };
      if (term === "painel") return { text: "Você procura painel LED (iluminação) ou quadro/painel elétrico?", intent: "ambiguous_short_query", confidence: 1.0 };
      if (term === "sensor") return { text: "Você procura um sensor avulso ou um produto (como refletor) que já vem com sensor?", intent: "ambiguous_short_query", confidence: 1.0 };
      if (term === "tomada") return { text: responses.ambiguousShortQueryTomada, intent: "ambiguous_short_query", confidence: 1.0 };
    }
  }

  if (clean === "quanto" || clean === "quanto custa" || clean === "qual o valor" || clean === "preco") {
     return { text: responses.ambiguousShortQueryQuanto, intent: "ambiguous_short_query", confidence: 1.0 };
  }

  if (clean === "qual melhor" || clean === "qual a melhor" || clean === "qual o melhor") {
     return { text: responses.ambiguousShortQueryQualMelhor, intent: "ambiguous_short_query", confidence: 1.0 };
  }
  
  if (clean === "parafuso") {
     return { text: "Você procura qual tipo e tamanho de parafuso? (Ex: para bucha 8, atarraxante, para madeira...)", intent: "ambiguous_short_query", confidence: 1.0 };
  }
  
  if (clean === "ferramenta" || clean === "ferramentas") {
     return { text: "Qual ferramenta você precisa? (Ex: alicate, chave de fenda, furadeira...)", intent: "ambiguous_short_query", confidence: 1.0 };
  }

  return null;
}

function handleMiniRag(clean: string, original?: string): ChatResponse | null {
  const normOriginal = original ? normalizeText(original) : "";
  // Simple RAG for Glossary
  for (const item of electricalGlossary) {
    if (
      clean.includes(item.term) || 
      item.aliases.some(a => clean.includes(a)) ||
      (normOriginal && (normOriginal.includes(item.term) || item.aliases.some(a => normOriginal.includes(a))))
    ) {
      return { text: item.explanation, intent: "technical_explanation", confidence: 0.95 };
    }
  }
  // Simple RAG for FAQ
  for (const key of Object.keys(faqKnowledge)) {
    const faq = faqKnowledge[key as keyof typeof faqKnowledge];
    // This is simple token matching; could be fuzzy but let's keep it simple string incl.
    const questionTokens = faq.question.replace('?','').split(' ').filter(w => w.length > 3);
    const matchCount = questionTokens.filter(t => clean.includes(t) || (normOriginal && normOriginal.includes(t))).length;
    if (matchCount >= Math.min(questionTokens.length, 2) && (clean.length > 5 || (normOriginal && normOriginal.length > 5))) {
       let mappedIntent = "faq_answer";
       if (key === "cart") mappedIntent = "cart_or_quote_info";
       else if (key === "delivery") mappedIntent = "delivery";
       else if (key === "payment") mappedIntent = "payment";
       else if (key === "warranty") mappedIntent = "warranty_original_products";
       return { text: faq.answer, intent: mappedIntent, confidence: 0.9 };
    }
  }
  return null;
}

export function understandBeforeAnswer(original: string): { response: ChatResponse, understanding: UnderstandingResult } {
  // Step 1: receiveInput (original)
  // Step 2 & 4: normalizeInput & correctProbableErrors
  const processed = preprocessMessage(original);
  let clean = processed.clean;

  // Conversational Context Pronoun Resolution
  if (chatContext.softContext.active && chatContext.softContext.subject) {
    const pronouns = ["ele", "ela", "dele", "dela", "esse", "este", "aquele", "essa", "esta", "aquela", "deles", "delas", "esses", "estes", "aqueles", "essas", "estas", "aquelas"];
    const demonstratives = ["esse", "este", "aquele", "essa", "esta", "aquela", "esses", "estes", "aqueles", "essas", "estas", "aquelas"];
    const subject = chatContext.softContext.subject;
    let replaced = false;
    for (const pr of pronouns) {
      if ((pr === "esta" || pr === "estas") && new RegExp(`\\b(como|voce|vc|ele|ela|tudo|onde|quem)\\s+${pr}\\b`, 'i').test(clean)) {
        continue;
      }
      const regex = new RegExp(`\\b${pr}\\b`, 'gi');
      if (regex.test(clean)) {
        clean = clean.replace(regex, (match, offset) => {
          const rest = clean.substring(offset + match.length).trim();
          const nextWordMatch = rest.match(/^[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+/);
          const nextWord = nextWordMatch ? nextWordMatch[0] : "";
          if (demonstratives.includes(pr) && isProductOrCategory(nextWord)) {
            return match;
          }
          return subject;
        });
        replaced = true;
      }
    }
    if (replaced) {
      processed.clean = clean;
    }
  }
  
  // Create a default deep UnderstandingResult object as per V12 spec
  const understanding: UnderstandingResult = {
    originalInput: processed.original,
    cleanInput: processed.clean,
    correctedInput: processed.clean,
    knownEntities: [],
    unknownTokens: [],
    ignoredNoiseTokens: [],
    probableMeaning: "",
    probableCategory: "",
    intentScores: {},
    winningIntent: "fallback",
    secondIntent: "",
    confidence: 0,
    ambiguityLevel: "none",
    contextUsed: false,
    contextAllowed: false,
    contextReason: "",
    shouldAskClarification: false,
    clarificationQuestion: null,
    validationWarnings: [],
    entities: {}
  };

  // Step 3: detectBasicHumanMessage
  if (Intents.isEmpty(processed.clean)) {
    understanding.winningIntent = "empty";
    understanding.confidence = 1.0;
    return {
      understanding,
      response: { text: "Parece que sua mensagem veio vazia! 😅 Tente digitar sua dúvida novamente.", intent: "empty", confidence: 1.0 }
    };
  }
  if (Intents.isOnlyEmoji(original)) {
    understanding.winningIntent = "emoji";
    understanding.confidence = 1.0;
    return {
      understanding,
      response: { text: "Gostei do emoji! 😄 Mas me conta — o que posso te ajudar? Lâmpadas, fios, tomadas, ferramentas... estou pronta! ⚡", intent: "emoji", confidence: 1.0 }
    };
  }

  // Step 5: identifyKnownEntities
  const { entities } = extractEntities(processed.clean);
  understanding.entities = entities;
  if (entities.products) understanding.knownEntities.push(...entities.products);
  if (entities.category) understanding.probableCategory = entities.category;
  
  // Step 7: checkContextDecision
  const contextStrength = getContextStrength(entities);
  const contextDecision = checkContextDecision(processed.clean, entities);
  const isContextual = contextDecision.allowed || contextStrength !== 'none';
  understanding.contextAllowed = isContextual;
  understanding.contextUsed = isContextual;
  understanding.contextReason = contextDecision.reason;

  // Step 6 & 8: inferProbableMeaning & calculateIntentScores
  const scores = calculateAdvancedIntentScores(processed.clean, entities, contextStrength);
  
  scores.forEach(s => understanding.intentScores[s.intent] = s.score);

  const bestScoreObj = scores.length > 0 ? scores[0] : null;
  let primaryIntent = bestScoreObj ? bestScoreObj.intent : "fallback";
  const hasProd = Intents.hasProductKeyword(processed.clean) || (entities.products && entities.products.length > 0);
  let confidence = bestScoreObj ? calculateConfidence(bestScoreObj.score, processed.clean, isContextual, hasProd) : calculateConfidence(0, processed.clean, isContextual, hasProd);

  // Fallback override logic
  if (primaryIntent === "fallback" || primaryIntent === "ask_disambiguation") {
    if (hasProd && Object.keys(Intents.ambiguousTerms).every(t => processed.clean !== t)) {
      const psScore = scores.find(s => s.intent === "product_search")?.score || 0;
      if (psScore >= 50) {
        primaryIntent = "product_search";
        confidence = Math.max(confidence, 0.85); // Prevent fallback by boosting confidence
      }
    }
  }

  understanding.winningIntent = primaryIntent;
  understanding.secondIntent = scores.length > 1 ? scores[1].intent : "";
  understanding.confidence = confidence;
  understanding.probableMeaning = `O usuário tentou: ${primaryIntent}`;

  // Step 9: detectAmbiguityOrConflict
  const requiresDisambiguation = primaryIntent === "ask_disambiguation";
  if (requiresDisambiguation) {
     understanding.ambiguityLevel = "high";
     understanding.shouldAskClarification = true;
  }

  // Security evaluation
  const safetyLevel = evaluateElectricalSafety(processed.clean, isContextual, entities);
  if (safetyLevel !== null) {
     understanding.validationWarnings.push("SAFETY_RISK_DETECTED");
  }

  // Step 10 & 11: decideConfidence & routeIntent
  let response = routeIntent(original, processed.clean, entities, isContextual, scores);

  // Step 12: searchKnowledgeOrProducts (done inside routeIntent)

  response = validateResponseBeforeReturn(response, response.intent || primaryIntent, entities);

  // Step 14: logDecision
  response.entities = entities;
  response.debug = {
    original: processed.original,
    clean: processed.clean,
    normalizedSteps: processed.normalizedSteps,
    intentScores: scores as IntentScore[]
  };

  // Agora logamos TODAS as interações na planilha, independentemente da confiança
  logInteraction({
    timestamp: new Date().toISOString(),
    originalInput: processed.original,
    cleanInput: processed.clean,
    detectedIntent: response.intent || "unknown",
    confidence: response.confidence || 0,
    entities,
    productsReturned: response.products?.length || 0,
    context: isContextual,
    debugReasons: scores[0]?.reasons || []
  });

  return { response, understanding };
}

export function routeIntent(
  _original: string, 
  clean: string, 
  entities: ExtractedEntities, 
  isContextual: boolean,
  scores: ReturnType<typeof calculateAdvancedIntentScores>
): ChatResponse {
  // 1. Process active hard context first so flows can be resolved
  if (chatContext.hardContext.active) {
    if (chatContext.hardContext.flow === "safety_guided") {
      if (entities.powerWatts || entities.voltage || entities.currentAmps) {
        clearHardContext();
        return { text: responses.electricalSafety, intent: "electrical_safety", confidence: 0.95 };
      }
    } else if (chatContext.hardContext.flow === "loose_wire") {
      const { products } = searchProducts(clean + " fio", entities);
      return { text: `Com base no que você me disse, encontrei essas opções:`, products, intent: "guided_product", confidence: 0.9 };
    } else if (chatContext.hardContext.flow === "loose_lamp") {
      const { products } = searchProducts(clean + " lampada", entities);
      return { text: `Com base no ambiente que você falou, veja o que temos:`, products, intent: "guided_product", confidence: 0.9 };
    } else if (chatContext.hardContext.flow === "quote") {
      const existingItems = (chatContext.hardContext.collected.items as string[]) || [];
      activateHardContext("quote", null, { items: [...existingItems, clean] });
      return { text: "Adicionado ao orçamento. Mais alguma coisa?", intent: "quote_item", confidence: 1.0 };
    }
  }

  // 2. Evaluate electrical safety
  const safetyLevel = evaluateElectricalSafety(clean, isContextual, entities);
  if (safetyLevel === "urgent_human_support") {
    return { text: responses.safetyUrgent, whatsappBtn: true, intent: "safety_urgent", confidence: 1.0 };
  }
  if (safetyLevel === "safety_warning") {
    return { text: responses.safetyWarning, intent: "safety_warning", confidence: 0.95 };
  }
  if (safetyLevel === "safety_guided_questions") {
    activateHardContext("safety_guided", null);
    return { text: responses.safetyGuided, intent: "safety_guided", confidence: 0.95 };
  }

  const hasProd = Intents.hasProductKeyword(clean) || (entities.products && entities.products.length > 0);
  
  const bestScoreObj = scores.length > 0 ? scores[0] : null;
  let intent = bestScoreObj ? bestScoreObj.intent : "fallback";
  let confidence = bestScoreObj ? calculateConfidence(bestScoreObj.score, clean, isContextual, hasProd) : calculateConfidence(0, clean, isContextual, hasProd);

  if (intent === "fallback" || intent === "ask_clarification" || intent === "empty") {
    if (hasProd && Object.keys(Intents.ambiguousTerms).every(t => clean !== t)) {
      const psScore = scores.find(s => s.intent === "product_search")?.score || 0;
      if (psScore >= 50) {
        intent = "product_search";
        confidence = Math.max(confidence, 0.85); // Prevent fallback here too
      }
    }
  }

  if (intent === "multiple_entities") {
    return { text: responses.multipleEntitiesUseful, intent, confidence };
  }

  if (intent === "ambiguous") {
    return { text: "Desculpe, você poderia ser um pouco mais específico? (Ex: lâmpada de led, disjuntor 20a, fio 2.5mm)", intent, confidence };
  }

  if (intent === "product_not_found") {
    const missingProduct = entities.products?.[0] || "esse item";
    return { text: `Poxa, não encontrei '${missingProduct}' no catálogo online agora. Posso te encaminhar para a equipe confirmar se temos na loja física para você?`, whatsappBtn: true, intent, confidence };
  }

  if (intent === "attribute_refinement") {
    const contextualInput = `${clean} ${chatContext.softContext.subject || ''}`;
    const mergedEntities = { ...chatContext.softContext.entities, ...entities };
    // Force category from context so attribute refinement stays within the correct category (e.g. green socket doesn't return green cable)
    const { products, total } = searchProducts(contextualInput, mergedEntities, 0, chatContext.softContext.category);
    if (products.length > 0) {
      const actions: ChatAction[] = [
        { type: "quote", label: "Adicionar ao orçamento" },
        { type: "whatsapp", label: "Consultar valor no WhatsApp" },
        { type: "category", label: "Ver todos relacionados", payload: { category: products[0].category } }
      ];
      if (total > 3) actions.unshift({ type: "show_more", label: "Mostrar mais itens parecidos" });
      return { text: `Filtrei as opções com essa especificação:`, products, actions, intent: "context_product_recommendation", confidence: 0.85 };
    }
    return { text: "Não encontrei opções com essa especificação exata, mas veja estas alternativas:", intent: "context_continuation", confidence: 0.7 };
  }

  if (intent === "product_search_with_nearest_match") {
    const requestedProduct = entities.products?.[0] || "esse item";
    const requestedType = entities.type || "essa especificação";
    const { products, total } = searchProducts(requestedProduct, entities);
    const actions: ChatAction[] = [
      { type: "quote", label: "Adicionar ao orçamento" },
      { type: "whatsapp", label: "Consultar valor no WhatsApp" }
    ];
    if (products.length > 0) {
      actions.push({ type: "category", label: "Ver todos relacionados", payload: { category: products[0].category } });
      if (total > 3) actions.unshift({ type: "show_more", label: "Mostrar mais itens parecidos" });
    }
    return { text: `Não temos '${requestedProduct} ${requestedType}' exato, mas temos estas opções próximas que atendem perfeitamente à maioria das aplicações dessa faixa. Veja as opções:`, products, actions, intent, confidence: 1.0 };
  }

  // Skip ambiguous terms check when the intent scorer already confidently classified the intent
  if (intent !== "human_support" && intent !== "developer_credit" && intent !== "off_topic") {
    const ambiguousResponse = handleAmbiguousTerms(clean);
    if (ambiguousResponse && confidence < 0.8) {
      return ambiguousResponse;
    }
  }

  const ragResponse = handleMiniRag(clean, _original);
  const explanationPatterns = ["o que e", "oq e", "o que é", "oq é", "como funciona", "para que serve", "qual a diferenca", "diferenca entre", "pq", "por que", "por que usar", "significa"];
  if (ragResponse && (explanationPatterns.some(p => clean.includes(p)) || intent === "product_spec_question")) {
    if (intent === "product_spec_question") {
      ragResponse.intent = "product_spec_question";
    }
    return ragResponse;
  }

  if (intent === "developer_credit") return { text: responses.developerCredit, intent, confidence };
  if (intent === "off_topic") return { text: responses.offTopic, intent, confidence };
  if (intent === "human_support") return { text: responses.humanSupportDirect, whatsappBtn: true, intent, confidence };
  if (intent === "missing_product_complaint") return { text: "Poxa, não encontrou o que procurava? Fale com nosso atendimento no WhatsApp para verificarmos no estoque físico para você!", whatsappBtn: true, intent, confidence };
  if (intent === "correction_wrong_result") return { text: responses.wrongResultCorrection, intent, confidence, whatsappBtn: true };
  if (intent === "technical_infrared") return { text: responses.techInfraredExplanation, intent, confidence };
  if (intent === "product_or_technical_infrared") return { text: responses.techInfraredBuying, intent, confidence, whatsappBtn: true };
  if (intent === "technical_explanation") {
    return { text: "Não encontrei uma explicação técnica detalhada sobre isso no momento. Quer falar com um especialista no WhatsApp?", whatsappBtn: true, intent, confidence };
  }
  
  if (intent === "store_hours") return { text: storeInfo.hours.weekdays + "\\n" + storeInfo.hours.saturday, intent, confidence };
  if (intent === "store_location") {
    if (clean.includes("instagram") || clean.includes("rede social")) {
      return { text: responses.storeInstagram, actions: [{ type: "whatsapp", label: "Falar no WhatsApp" }], intent, confidence };
    }
    return { text: storeInfo.address, actions: [{ type: "whatsapp", label: "Como chegar" }], intent, confidence };
  }
  if (intent === "payment") return { text: "Aceitamos PIX, Dinheiro e Cartões.", intent, confidence };
  if (intent === "delivery") return { text: "Fazemos entregas em " + storeInfo.city + " e regiões vizinhas.", intent, confidence };
  if (intent === "warranty_original_products") return { text: responses.storeOriginals, intent, confidence };
  if (intent === "cart_or_quote_info") return { text: responses.storeCart, intent, confidence };
  if (intent === "current_date") return { text: `Hoje é ${new Date().toLocaleDateString('pt-BR')}.`, intent, confidence };
  if (intent === "real_time") {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { text: `${responses.realTimePrefix}${currentTimeStr}.`, intent, confidence };
  }
  if (intent === "multi_entity_product_or_technical") {
    return { text: responses.multipleEntityInfraredOr, intent, confidence };
  }

  if (intent === "quote_start") {
    activateHardContext("quote", null, { items: [] });
    return { text: responses.quoteStart, intent, confidence };
  }

  if (intent === "greeting" || intent === "courtesy") {
    if (intent === "greeting") return { text: responses.greeting, intent, confidence };
    return { text: responses.courtesy, intent, confidence };
  }

  if (intent === "show_more_results") {
    if (chatContext.lastSearch) {
      incrementSearchOffset(3);
      const { query, category, offset, entities: lastEntities } = chatContext.lastSearch;
      const shownProductIds = chatContext.lastSearch ? chatContext.lastSearch.shownProductIds : [];
      const { products, total } = searchProducts(query, lastEntities, offset, category, shownProductIds);
      
      if (products.length > 0) {
        const actions: ChatAction[] = [
          { type: "quote", label: "Adicionar ao orçamento" },
          { type: "whatsapp", label: "Consultar valor no WhatsApp" },
          { type: "category", label: "Ver todos relacionados", payload: { category: products[0].category } }
        ];
        if (offset + 3 < total) actions.unshift({ type: "show_more", label: "Mostrar mais itens parecidos" });
        return { text: responses.moreResults, products, actions, intent, confidence };
      } else {
        return { text: responses.noMoreResults, whatsappBtn: true, intent, confidence };
      }
    }
    return { text: "Não encontrei uma pesquisa recente para mostrar mais opções.", intent: "show_more_results", confidence };
  }

  if (intent === "product_price") {
    if (hasProd) {
      const { products, total } = searchProducts(clean, entities);
      if (products.length > 0) {
        const actions: ChatAction[] = [
          { type: "quote", label: "Adicionar ao orçamento" }, 
          { type: "whatsapp", label: "Consultar valor" },
          { type: "category", label: "Ver todos relacionados", payload: { category: products[0].category } }
        ];
        if (total > 3) actions.unshift({ type: "show_more", label: "Mostrar mais itens parecidos" });
        return { text: "Os valores são sob consulta. Posso te mostrar opções relacionadas.", products, actions, intent, confidence };
      }
    }
    return { text: "Os valores são sob consulta. Fale com a equipe para confirmar valor.", whatsappBtn: true, actions: [{ type: "whatsapp", label: "Consultar valor com atendente" }], intent, confidence };
  }

  if (intent === "product_recommendation") {
    let recProducts = undefined;
    if (hasProd) {
      const { products } = searchProducts(clean, entities);
      if (products.length > 0) recProducts = products;
    }
    
    const getActionsForRecs = (prods: Product[] | undefined): ChatAction[] | undefined => {
      if (!prods || prods.length === 0) return undefined;
      return [
        { type: "quote", label: "Adicionar ao orçamento" },
        { type: "whatsapp", label: "Consultar valor no WhatsApp" },
        { type: "category", label: "Ver todos relacionados", payload: { category: prods[0].category } }
      ];
    };

    if (clean.includes("quarto") || clean.includes("sala")) return { text: responses.recommendationQuartoSala, products: recProducts, actions: getActionsForRecs(recProducts), intent, confidence };
    if (clean.includes("cozinha") || clean.includes("banheiro")) return { text: responses.recommendationCozinhaBanheiro, products: recProducts, actions: getActionsForRecs(recProducts), intent, confidence };
    if (clean.includes("externa") || clean.includes("garagem")) return { text: responses.recommendationExterna, products: recProducts, actions: getActionsForRecs(recProducts), intent, confidence };
    
    if (recProducts) return { text: "Aqui estão as melhores opções que encontrei:", products: recProducts, actions: getActionsForRecs(recProducts), intent, confidence };
    return { text: responses.recommendationAskEnvironment, intent, confidence: 0.8 };
  }

  if (intent === "product_search" && confidence < 0.6) {
    return { text: "Para eu te ajudar melhor, você poderia me dar mais detalhes sobre o produto que procura?", intent: "ask_clarification", confidence: 1.0 };
  }

  if (intent === "product_search" && hasProd) {
    const isVentiladorAcessorios = (clean.includes("ventilador") || clean.includes("exaustor")) && (clean.includes("instalar") || clean.includes("acessorio") || clean.includes("acessórios") || clean.includes("coisa para"));
    if (isVentiladorAcessorios) {
      return { text: responses.ventiladorAcessorios, intent, confidence };
    }
    const isProtectedTechnical = /\bdr\b/.test(clean) || /\bdps\b/.test(clean) || clean.includes("fotocelula");
    if (!isProtectedTechnical) {
      const { products, total } = searchProducts(clean, entities);
      if (products.length > 0) {
        const actions: ChatAction[] = [
          { type: "quote", label: "Adicionar ao orçamento" }, 
          { type: "whatsapp", label: "Consultar valor no WhatsApp" },
          { type: "category", label: "Ver todos relacionados", payload: { category: products[0].category } }
        ];
        if (total > 3) actions.unshift({ type: "show_more", label: "Mostrar mais itens parecidos" });
        return { text: responses.genericAvailable, products, actions, whatsappBtn: true, intent, confidence };
      }
      return { text: responses.productNotFound, whatsappBtn: true, intent, confidence };
    }
  }

  if (intent === "ask_disambiguation") {
    return { text: "Você poderia dar mais detalhes sobre qual produto ou modelo específico você procura?", intent, confidence: 1.0 };
  }

  if (intent === "repair_context_clarification" || (isContextual && chatContext.softContext.subject)) {
    const contextualInput = `${clean} ${chatContext.softContext.subject || ''}`;
    const { products, total } = searchProducts(contextualInput, chatContext.softContext.entities);
    if (products.length > 0) {
      const actions: ChatAction[] = [
        { type: "quote", label: "Adicionar ao orçamento" },
        { type: "whatsapp", label: "Consultar valor no WhatsApp" },
        { type: "category", label: "Ver todos relacionados", payload: { category: products[0].category } }
      ];
      if (total > 3) actions.unshift({ type: "show_more", label: "Mostrar mais itens parecidos" });
      return { text: `Como estávamos falando sobre ${chatContext.softContext.subject || 'isso'}, encontrei estas opções:`, products, actions, intent: "context_product_recommendation", confidence: 0.85 };
    }
    return { text: "Ainda falando do mesmo assunto? Se puder me dar mais detalhes do que precisa, posso achar os produtos ideais!", intent: "context_continuation", confidence: 0.7 };
  }

  return { text: responses.fallback, whatsappBtn: true, intent: "fallback", confidence: 0.5 };
}

export function processQuery(input: string): ChatResponse {
  checkContextExpiration();

  const { response, understanding } = understandBeforeAnswer(input);

  // Update context side effects
  if ((response.intent === "product_search" || response.intent === "show_more_results") && response.products && response.products.length > 0) {
    const category = response.products[0].category;
    const newIds = response.products.map(p => p.id);
    const existingIds = chatContext.lastSearch ? chatContext.lastSearch.shownProductIds : [];
    updateLastSearch(
      preprocessMessage(input).clean, 
      category, 
      understanding.entities, 
      [...new Set([...existingIds, ...newIds])], 
      chatContext.lastSearch ? chatContext.lastSearch.totalMatches : response.products.length
    );
  }

  updateContext(preprocessMessage(input).clean, understanding.entities, response);

  // Step 15: returnResponse
  return response;
}
