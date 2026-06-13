import type { ExtractedEntities, EntityMatch } from './types';
import { productAndTechnicalKeywords, synonyms, technicalProtectedTerms } from './chatDictionaries';
import { productTaxonomy } from './knowledge/productTaxonomy';

const environments = [
  "quarto", "sala", "cozinha", "banheiro", "escritorio", 
  "area externa", "garagem", "quintal", "fachada", 
  "corredor", "area de servico", "loja", "comercio"
];

const usages = [
  "iluminacao", "tomada", "chuveiro", "ar condicionado", 
  "motor", "camera", "sensor", "aquecimento", "instalacao geral"
];

const compoundProductTerms: Record<string, string> = {
  "lampada led": "lampada_led",
  "tomada 20a": "tomada", // the prompt says 'tomada_20a' but later says extract product="tomada" and currentAmps=20. Wait. If I map "tomada 20a" to "tomada", I won't have multiple entities. Let me just map to 'tomada_20a' and then handle it? Actually the prompt says: 'tomada 20a' -> product_search, products must contain 'tomadas', mustNotIntent: multiple_entities.
  // Actually, I'll use exactly what the prompt requested for compound terms.
  "sensor de presenca": "sensor_presenca",
  "sensor de movimento": "sensor_presenca",
  "sensor infravermelho": "sensor_presenca",
  "refletor com sensor": "refletor_sensor",
  "fita led": "fita_led",
  "luz fria": "luz_fria",
  "luz quente": "luz_quente",
  "luz neutra": "luz_neutra"
};

export function isAttributeOfProduct(term: string): boolean {
  if (/\d+(a|w|v)\b/i.test(term)) return true;
  return [
    "led", "fria", "quente", "neutra", "branca", "amarela",
    "lumen", "lumens", "kelvin", "presenca", "movimento",
    "sensor", "ip66", "bivolt"
  ].some(attr => term.includes(attr));
}

export function hasTrueMultipleEntities(entities: ExtractedEntities, clean: string): boolean {
  if (!entities.products) return false;
  const mainProducts = entities.products.filter(p => !isAttributeOfProduct(p) && p !== "lampada_led");
  
  const distinctProducts = mainProducts.filter(p1 => 
    !mainProducts.some(p2 => p1 !== p2 && p2.includes(p1))
  );

  if (distinctProducts.length < 2) return false;
  const hasConnector = /\b(e|ou|tambem|alem de)\b|,/.test(clean);
  return hasConnector;
}

export function classifyLuzUsage(cleanText: string): "product" | "store_name" | "power_issue" | "technical" | "location" | "ambiguous" | "unknown" {
  if (cleanText.includes("onde fica") || cleanText.includes("endereco")) {
    if (cleanText.includes("haja luz")) return "location";
  }
  if (cleanText.includes("acabou a luz") || cleanText.includes("sem luz") || cleanText.includes("caiu a luz") || cleanText.includes("piscar a luz") || cleanText.includes("luz piscando")) {
    return "power_issue";
  }
  if (cleanText.includes("haja luz") && cleanText.length <= 15) {
    return "store_name";
  }
  if (cleanText.includes("luz fria") || cleanText.includes("luz quente") || cleanText.includes("luz neutra") || cleanText.includes("luz de emergencia") || cleanText.includes("luz infravermelha") || cleanText.includes("luz infravermelho") || cleanText.includes("luz ultravioleta")) {
    return "technical";
  }
  if (cleanText.includes("tem luz") || cleanText.includes("vende luz") || cleanText.includes("quero luz") || cleanText.includes("luz para")) {
    return "product";
  }
  if (cleanText === "luz") {
    return "ambiguous"; // Handled as unknown for exact match
  }
  return "unknown";
}

export function extractEntities(cleanText: string): { entities: ExtractedEntities, matches: EntityMatch[] } {
  const entities: ExtractedEntities = {
    products: []
  };
  const matches: EntityMatch[] = [];

  const foundProducts = new Set<string>();

  // Helper to add match
  const addMatch = (value: string, type: EntityMatch["type"], confidence: number, source: EntityMatch["source"]) => {
    matches.push({ value, type, confidence, source });
  };

  // Replace compound terms before splitting
  let modifiedCleanText = cleanText;
  for (const [key, val] of Object.entries(compoundProductTerms)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    if (regex.test(modifiedCleanText)) {
      foundProducts.add(val);
      addMatch(val, "product", 0.98, "exact");
      // Optionally replace it so we don't extract parts of it again
      modifiedCleanText = modifiedCleanText.replace(regex, val);
    }
  }

  const colors = ["vermelho", "vermelha", "verde", "azul", "amarelo", "amarela", "branco", "branca", "preto", "preta"];
  for (const c of colors) {
    if (new RegExp(`\\b${c}\\b`, "i").test(cleanText)) {
      entities.color = c;
      addMatch(c, "attribute", 1.0, "exact");
      break;
    }
  }

  const types = ["usb", "dupla", "simples", "fria", "quente", "neutra", "sensor", "2mm", "1,5mm", "2,5mm", "4mm", "6mm"];
  for (const t of types) {
    if (new RegExp(`\\b${t}\\b`, "i").test(cleanText)) {
      entities.type = t;
      addMatch(t, "attribute", 1.0, "exact");
      // Don't break, maybe they said "usb dupla"
    }
  }

  // Handle "tomada 20a" which should just be "tomada" and 20a current
  if (cleanText.includes("tomada 20a")) {
    foundProducts.add("tomada");
    entities.currentAmps = 20;
    addMatch("tomada", "product", 0.98, "exact");
  } else if (cleanText.includes("tomada 10a")) {
    foundProducts.add("tomada");
    entities.currentAmps = 10;
    addMatch("tomada", "product", 0.98, "exact");
  } else if (cleanText.includes("tomada")) {
    foundProducts.add("tomada");
    addMatch("tomada", "product", 0.98, "exact");
  }

  // Handle "lampada led" correctly for the search: we might need "lampada" too
  if (cleanText.includes("lampada led")) {
    foundProducts.add("lampada");
  }

  // Extract products and handle "ou", "e", "," connectors
  const splitParts = modifiedCleanText.split(/\bou\b|\be\b|,/i).map(p => p.trim());
  
  for (const part of splitParts) {
    if (!part) continue;
    
    // Filtros de ruído
    if (/^\d+$/.test(part)) continue;
    if (part.length < 3 && part !== "fio" && part !== "luz" && part !== "20a" && part !== "10a") continue;

    // Check technical protected terms first
    for (const term of technicalProtectedTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(part)) {
        foundProducts.add(term);
        addMatch(term, "technical", 0.98, "exact");
      }
    }

    // Extract products using Taxonomy
    for (const key of Object.keys(productTaxonomy)) {
      const entry = productTaxonomy[key as keyof typeof productTaxonomy];
      const allTerms = [...entry.canonicalProducts, ...entry.aliases];
      for (const term of allTerms) {
        if (foundProducts.has(term)) continue;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        if (regex.test(part)) {
          foundProducts.add(term);
          if (term === "luz") {
            const usage = classifyLuzUsage(cleanText);
            if (usage === "product") addMatch(term, "product", 0.60, "exact");
            else if (usage === "technical") addMatch(term, "technical", 0.80, "exact");
            else if (usage === "store_name") addMatch(term, "store_info", 0.90, "exact");
            else addMatch(term, "ambiguous", 0.30, "exact");
          } else if (term === "suporte" || term === "entrega") {
            addMatch(term, "ambiguous", 0.50, "exact");
          } else {
            addMatch(term, "product", 0.95, "exact");
          }
        }
      }
    }

    // Also check synonyms
    for (const [key, synList] of Object.entries(synonyms)) {
      for (const syn of synList) {
        if (foundProducts.has(key) || foundProducts.has(syn)) continue;
        const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        if (regex.test(part)) {
          if (productAndTechnicalKeywords.includes(key)) {
            foundProducts.add(key);
            addMatch(key, "product", 0.85, "synonym");
          }
        }
      }
    }
  }

  if (foundProducts.size > 0) {
    entities.products = Array.from(foundProducts);
  }

  // Extract environment
  for (const env of environments) {
    const escaped = env.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(cleanText)) {
      entities.environment = env;
      addMatch(env, "environment", 0.95, "exact");
      break;
    }
  }

  // Extract usage
  for (const usage of usages) {
    const escaped = usage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(cleanText)) {
      entities.usage = usage;
      addMatch(usage, "usage", 0.95, "exact");
      break;
    }
  }

  // Extract power (Watts)
  const wattMatch = cleanText.match(/(\d+)\s*(?:watts?|w)\b/i);
  if (wattMatch) {
    entities.powerWatts = parseInt(wattMatch[1], 10);
    addMatch(`${entities.powerWatts}w`, "unit", 1.0, "exact");
  }

  // Extract voltage (Volts)
  const voltMatch = cleanText.match(/(\d+)\s*(?:volts?|v)\b/i);
  if (voltMatch) {
    entities.voltage = parseInt(voltMatch[1], 10);
    addMatch(`${entities.voltage}v`, "unit", 1.0, "exact");
  }

  // Extract current (Amperes)
  const ampMatch = cleanText.match(/(\d+)\s*(?:amperes?|a)\b/i);
  if (ampMatch) {
    entities.currentAmps = parseInt(ampMatch[1], 10);
    addMatch(`${entities.currentAmps}a`, "unit", 1.0, "exact");
  }

  // Extract color temperature (Kelvin)
  const kelvinMatch = cleanText.match(/(\d+)\s*kelvins?\b/i);
  if (kelvinMatch) {
    entities.colorTemperatureKelvin = parseInt(kelvinMatch[1], 10);
    addMatch(`${entities.colorTemperatureKelvin}k`, "unit", 1.0, "exact");
  }

  // Determine hasIsolatedAttribute
  const hasProducts = entities.products && entities.products.length > 0;
  const hasCategories = entities.category !== undefined;
  const hasEnvOrUsage = entities.environment !== undefined || entities.usage !== undefined;
  
  const hasSomeAttribute = 
    entities.color !== undefined || 
    entities.type !== undefined || 
    entities.powerWatts !== undefined || 
    entities.voltage !== undefined || 
    entities.currentAmps !== undefined ||
    entities.colorTemperatureKelvin !== undefined;

  if (!hasProducts && !hasCategories && !hasEnvOrUsage && hasSomeAttribute) {
    entities.hasIsolatedAttribute = true;
  }

  return { entities, matches };
}
