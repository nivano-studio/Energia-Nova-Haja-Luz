import type { ChatContextState, ExtractedEntities, ChatResponse } from './types';
import { productTaxonomy } from './knowledge/productTaxonomy';

export const chatContext: ChatContextState = {
  hardContext: {
    active: false,
    flow: null,
    expected: null,
    collected: {},
    startedAt: 0,
    stepCount: 0
  },
  softContext: {
    active: false,
    subject: null,
    category: null,
    entities: {},
    updatedAt: 0,
    contextStrength: 'none'
  },
  lastSearch: null,
  messageCountSinceLastSubject: 0
};

export const resetChatContext = () => {
  chatContext.hardContext = {
    active: false,
    flow: null,
    expected: null,
    collected: {},
    startedAt: 0,
    stepCount: 0
  };
  chatContext.softContext = {
    active: false,
    subject: null,
    category: null,
    entities: {},
    updatedAt: 0,
    contextStrength: 'none'
  };
  chatContext.lastSearch = null;
  chatContext.messageCountSinceLastSubject = 0;
};

export function checkContextExpiration() {
  const now = Date.now();
  
  // Hard context expires after 3 minutes or 5 messages
  if (chatContext.hardContext.active) {
    if (now - chatContext.hardContext.startedAt > 3 * 60 * 1000 || chatContext.hardContext.stepCount > 5) {
      chatContext.hardContext.active = false;
      chatContext.hardContext.flow = null;
      chatContext.hardContext.expected = null;
    }
  }

  // Soft context expires after 5 minutes or 6 messages without reinforcement
  if (chatContext.softContext.active) {
    if (now - chatContext.softContext.updatedAt > 5 * 60 * 1000 || chatContext.messageCountSinceLastSubject > 6) {
      chatContext.softContext.active = false;
      chatContext.softContext.subject = null;
      chatContext.softContext.entities = {};
      chatContext.softContext.contextStrength = 'none';
    }
  }
}

export function getContextStrength(entities: ExtractedEntities): 'none' | 'weak' | 'medium' | 'strong' {
  if (!chatContext.softContext.active || !chatContext.softContext.subject) return 'none';
  
  // If the user changed category
  if (entities.products && entities.products.length > 0) {
     const currentCat = getCategoryForProduct(entities.products[0]);
     const contextCat = getCategoryForProduct(chatContext.softContext.subject);
     if (currentCat && contextCat && currentCat !== contextCat) {
       return 'none';
     }
  }

  // If last message was product search and we are close
  if (chatContext.messageCountSinceLastSubject === 0 || chatContext.messageCountSinceLastSubject === 1) {
    return 'strong';
  }

  if (chatContext.messageCountSinceLastSubject <= 3) {
    return 'medium';
  }

  return 'weak';
}

export function activateHardContext(flow: ChatContextState['hardContext']['flow'], expected: ChatContextState['hardContext']['expected'], collected: Record<string, unknown> = {}) {
  chatContext.hardContext = {
    active: true,
    flow,
    expected,
    collected: { ...chatContext.hardContext.collected, ...collected },
    startedAt: Date.now(),
    stepCount: 0
  };
}

export function clearHardContext() {
  chatContext.hardContext.active = false;
  chatContext.hardContext.flow = null;
  chatContext.hardContext.expected = null;
  chatContext.hardContext.collected = {};
}

const ignoredIntents = ["greeting", "courtesy", "thanks", "goodbye", "laugh", "off_topic", "fallback", "correction_wrong_result"];

export function updateLastSearch(query: string, category: string | null, entities: ExtractedEntities, shownProductIds: string[], totalMatches: number) {
  chatContext.lastSearch = {
    query,
    category,
    entities,
    shownProductIds,
    offset: 0,
    totalMatches,
    timestamp: Date.now()
  };
}

export function incrementSearchOffset(incrementBy: number) {
  if (chatContext.lastSearch) {
    chatContext.lastSearch.offset += incrementBy;
  }
}

export function updateContext(_cleanInput: string, entities: ExtractedEntities, response: ChatResponse) {
  const now = Date.now();
  chatContext.messageCountSinceLastSubject += 1;
  
  if (chatContext.hardContext.active) {
    chatContext.hardContext.stepCount += 1;
  }

  if (response.intent && ignoredIntents.includes(response.intent)) {
    // Don't update context on these
    return;
  }

  chatContext.softContext.updatedAt = now;
  chatContext.softContext.active = true;

  if (entities.products && entities.products.length > 0) {
    chatContext.softContext.subject = entities.products[0];
    chatContext.messageCountSinceLastSubject = 0; // reset as we found a subject
  }
  
  if (Object.keys(entities).length > 0) {
    // Always merge entities to preserve metadata like "location", "voltage" across messages
    const mergedProducts = entities.products && entities.products.length > 0 ? entities.products : chatContext.softContext.entities.products;
    chatContext.softContext.entities = { 
      ...chatContext.softContext.entities, 
      ...entities,
      products: mergedProducts
    };
  }
}

const shortMessages = ["tem", "quanto", "qual melhor", "serve", "e esse", "sim", "nao", "quero", "pode ser", "me mostra", "manda", "ok"];

function getCategoryForProduct(product: string): string | null {
  for (const key of Object.keys(productTaxonomy)) {
    const entry = productTaxonomy[key as keyof typeof productTaxonomy];
    if (entry.canonicalProducts.includes(product) || entry.aliases.includes(product)) {
      return entry.label;
    }
  }
  return null;
}

export function checkContextDecision(cleanInput: string, entities: ExtractedEntities): { allowed: boolean; reason: string } {
  if (chatContext.hardContext.active) return { allowed: true, reason: "Hard context active" };

  if (!chatContext.softContext.active || !chatContext.softContext.subject) {
    return { allowed: false, reason: "No active context" };
  }

  // Se houver uma nova entidade (produto) na mensagem
  if (entities.products && entities.products.length > 0) {
    const currentMainProduct = entities.products[0];
    const contextSubject = chatContext.softContext.subject;
    
    // Se o produto atual for exatamente igual ao do contexto, pode ser continuação ("tem parafuso" -> "cade o parafuso")
    if (currentMainProduct === contextSubject) {
      return { allowed: true, reason: "Same entity mentioned" };
    }

    const currentCat = getCategoryForProduct(currentMainProduct);
    const contextCat = getCategoryForProduct(contextSubject);

    // Se a categoria do novo produto for diferente da categoria do produto no contexto, a nova entidade vence e invalida o contexto.
    if (currentCat && contextCat && currentCat !== contextCat) {
      return { allowed: false, reason: `New strong entity (${currentCat}) differs from context (${contextCat})` };
    }
    
    // Se forem da mesma categoria, mas produtos diferentes ("tem tomada?" -> "e interruptor?")
    // Deixamos o contexto ativo caso precise, mas a nova entidade domina a busca.
    return { allowed: false, reason: "New strong entity overrides context" };
  }

  // Verifica se a frase é um ruído curto ou continuação
  const words = cleanInput.split(' ').filter(w => w.length > 0);
  
  if (words.length <= 2) {
    return { allowed: true, reason: "Very short message (1-2 words)" };
  }
  
  if (words.length <= 4 && shortMessages.some(sm => cleanInput.includes(sm))) {
    return { allowed: true, reason: "Short message with contextual keywords" };
  }

  // If the message only extracted technical entities but no product
  if (!entities.products || entities.products.length === 0) {
    if (entities.powerWatts || entities.voltage || entities.currentAmps || entities.colorTemperatureKelvin) {
      return { allowed: true, reason: "Technical attributes extracted without product" };
    }
  }

  return { allowed: false, reason: "Long message without clear contextual ties" };
}

export function isShortContextMessage(cleanInput: string, entities: ExtractedEntities): boolean {
  return checkContextDecision(cleanInput, entities).allowed;
}
