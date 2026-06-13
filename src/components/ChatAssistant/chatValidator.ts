import type { ChatResponse, ExtractedEntities } from './types';
// import { safetyRules } from './knowledge/safetyRules';
// import { responseGuidelines } from './knowledge/responseGuidelines';
import { productTaxonomy } from './knowledge/productTaxonomy';
// import type { Product } from '../../data/products';

// Fallback to locally defined rules if import doesn't match perfectly
const localSafetyRules = {
  prohibitedTerms: ["r$", "reais", "frete gratis", "compre agora"],
  maxProductsReturned: 3
};

/**
 * Validates the final response before returning it to the user.
 * Blocks prices, removes wrong categories, caps products, and enforces guidelines.
 */
export function validateResponseBeforeReturn(
  response: ChatResponse,
  intent: string,
  entities?: ExtractedEntities,
  _cleanInput?: string
): ChatResponse {
  let validResponse = { ...response };
  
  // 1. Remove duplicate products and cap at 3
  if (validResponse.products && validResponse.products.length > 0) {
    const uniqueIds = new Set<string>();
    validResponse.products = validResponse.products.filter(p => {
      if (uniqueIds.has(p.id)) return false;
      uniqueIds.add(p.id);
      return true;
    });

    if (validResponse.products.length > localSafetyRules.maxProductsReturned) {
      validResponse.products = validResponse.products.slice(0, localSafetyRules.maxProductsReturned);
    }
  }

  // 2. Block prices (R$ or specific numbers)
  if (/R\$\s*\d+/.test(validResponse.text) || /\d+,\d{2}/.test(validResponse.text)) {
    validResponse.text = validResponse.text.replace(/R\$\s*\d+(?:,\d{2})?/g, "[Valor sob consulta]");
  }

  // 3. Force "sob consulta" on product_price
  if (intent === 'product_price' && !validResponse.text.toLowerCase().includes("consulta")) {
    validResponse.text += "\n\nComo os valores podem variar e há condições especiais para profissionais, todos os nossos preços são sob consulta. Quer que eu envie este orçamento para o WhatsApp?";
  }

  // 4. Off-topic shouldn't return products
  if (intent === 'off_topic') {
    validResponse.products = [];
  }

  // 5. Courtesy shouldn't talk about catalog if it's pure greeting
  if (intent === 'courtesy' && validResponse.text.toLowerCase().includes("catálogo")) {
    validResponse.text = "Olá! Como posso ajudar você hoje com materiais elétricos?";
  }

  // 6. Block wrong categories based on taxonomy
  if (validResponse.products && validResponse.products.length > 0 && entities?.products && entities.products.length > 0) {
    // Find the primary product mentioned
    const mentionedProd = entities.products[0].toLowerCase();
    
    // Find its taxonomy entry
    let taxonomyEntry = null;
    for (const key of Object.keys(productTaxonomy)) {
      const entry = productTaxonomy[key as keyof typeof productTaxonomy];
      if (entry.canonicalProducts.includes(mentionedProd) || entry.aliases.includes(mentionedProd)) {
        taxonomyEntry = entry;
        break;
      }
    }

    if (taxonomyEntry && taxonomyEntry.rejectCategories) {
      validResponse.products = validResponse.products.filter(p => {
        // If the product's category is in the rejected list, block it
        return !taxonomyEntry.rejectCategories.includes(p.category);
      });
    }
  }

  // 7. Ensure confidence metric is attached if missing
  if (validResponse.confidence === undefined) {
    validResponse.confidence = 1;
  }

  // 8. If confidence is very low, force disambiguation/fallback
  const exemptIntents = ["ask_disambiguation", "ambiguous_short_query", "greeting", "courtesy"];
  if (validResponse.confidence < 0.6 && !exemptIntents.includes(validResponse.intent || "")) {
    validResponse.products = [];
    
    // Asks assertive questions based on extracted entities instead of generic fallback
    if (entities?.products && entities.products.length > 0) {
      validResponse.text = `Entendi que você procura algo relacionado a ${entities.products[0]}, mas pode me dar mais detalhes do tipo ou modelo exato?`;
    } else if (entities?.environment) {
      validResponse.text = `Você mencionou o ambiente ${entities.environment}. Que tipo de produto você precisa para lá? Lâmpada, tomada, fita led?`;
    } else {
      validResponse.text = "Eu não tenho certeza absoluta do que você procura. Poderia detalhar melhor se é iluminação, fios ou outro material elétrico?";
    }
    validResponse.intent = "ask_clarification";
  }

  return validResponse;
}
