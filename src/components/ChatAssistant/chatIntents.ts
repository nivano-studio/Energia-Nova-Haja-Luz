import { 
  buyingVerbs, desireVerbs, hoursVerbs 
} from './chatVerbs';
import { productAndTechnicalKeywords, strongOffTopicTerms } from './chatDictionaries';
import type { ExtractedEntities } from './types';
import { hasTrueMultipleEntities } from './chatEntities';

const greetings = ["oi", "oii", "oiii", "oiie", "oie", "ola", "olaa", "olaaa", "opa", "opaa", "eai", "e ai", "eae", "e ae", "iae", "fala", "fala ai", "salve", "bom dia", "bomdia", "boa tarde", "boatarde", "boa noite", "boanoite", "hello", "helloo", "hi", "hey", "alo"];
const courtesyPatterns = [
  "como esta", "como esta?", "como voce esta", "como vc esta", "como ce esta", 
  "como vai", "como vai?", "tudo bem", "tudo bom", "td bem", "td bom", 
  "beleza", "blz", "suave", "de boa", "tudo certo", "tranquilo", "na paz", 
  "joia", "certinho", "como estamos"
];

const developerCreditPatterns = [
  "quem fez", "quem criou", "quem desenvolveu", "quem programou", "desenvolvedor", "criador"
];
const developerTargets = [
  "site", "ia", "chatbot", "assistente", "sistema", "atendimento", "robo", "robozinho"
];

const wrongResultPatterns = [
  "isso nao e", "isso nao é", "nao e isso", "nao é isso", "produto errado", 
  "resultado errado", "voce errou", "você errou", "ta errado", "esta errado", "isso esta errado", 
  "isso ta errado", "nao era isso", "resposta errada",
  "nao e lampada", "nao e fio", "nao e tomada", "nao e disjuntor", 
  "nao e refletor", "nao e sensor"
];

export const ambiguousTerms: Record<string, string[]> = {
  luz: ["lampada", "iluminacao", "energia", "nome da loja"],
  chave: ["disjuntor", "interruptor", "ferramenta", "chave geral"],
  suporte: ["atendimento", "peça/suporte físico"],
  cabo: ["fio/cabo eletrico", "cabo de ferramenta", "cabo extensor"],
  painel: ["painel led", "quadro/painel eletrico"],
  sensor: ["sensor avulso", "produto com sensor"]
};

export { strongOffTopicTerms };

export function isEmpty(text: string): boolean {
  return !text || text.trim() === "";
}

export function isOnlyEmoji(text: string): boolean {
  return /^[\p{Emoji}\s]+$/u.test(text) && !text.match(/[a-zA-Z0-9]/);
}

export function hasProductKeyword(text: string): boolean {
  return productAndTechnicalKeywords.some(kw => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, 'i').test(text));
}

export interface IntentScore {
  intent: string;
  score: number;
  reasons: string[];
}

export function calculateIntentScores(text: string, entities?: ExtractedEntities, hasContext: boolean = false): IntentScore[] {
  const scores: IntentScore[] = [];

  const hasProd = hasProductKeyword(text) || (entities?.products && entities.products.length > 0);
  const hasCat = entities?.category !== undefined;
  const hasEnv = entities?.environment !== undefined;
  
  // product_search
  let psScore = 0;
  const psReasons: string[] = [];
  const buyingMatch = buyingVerbs.some(v => text.includes(v)) || desireVerbs.some(v => text.includes(v)) || /\btem\b/.test(text) || /\bvende\b/.test(text) || /\bquero\b/.test(text) || /\bpreciso\b/.test(text);
  if (buyingMatch) { psScore += 50; psReasons.push("Verbo comercial detectado"); }
  if (hasProd) { 
    psScore += 50; psReasons.push("Produto detectado"); 
    if (text.split(' ').length <= 3) {
      psScore += 20;
      psReasons.push("Menção direta curta ao produto");
    }
  }
  if (hasCat) { psScore += 20; psReasons.push("Categoria detectada"); }
  if (hasContext) { psScore += 20; psReasons.push("Contexto ativo"); }
  if (strongOffTopicTerms.some(t => text.includes(t))) { psScore -= 80; psReasons.push("Termo off-topic forte"); }
  if (psScore > 0) scores.push({ intent: "product_search", score: psScore, reasons: psReasons });

  // product_price
  let ppScore = 0;
  const ppReasons: string[] = [];
  const pricePatterns = ["quanto custa", "qual valor", "preco", "qto custa", "quanto", "custa"];
  if (pricePatterns.some(p => text.includes(p))) { ppScore += 80; ppReasons.push("Padrão de preço detectado"); }
  if (hasProd || hasContext) { ppScore += 50; ppReasons.push("Produto ou contexto"); }
  if (ppScore > 0) scores.push({ intent: "product_price", score: ppScore, reasons: ppReasons });

  // product_recommendation
  let prScore = 0;
  const prReasons: string[] = [];
  const recPatterns = ["melhor", "melhores", "recomenda", "me indica", "indica", "qual lampada", "boa para", "ideal para"];
  if (recPatterns.some(p => text.includes(p))) { prScore += 80; prReasons.push("Padrão de recomendação detectado"); }
  if (hasProd || hasCat) { prScore += 50; prReasons.push("Produto ou categoria"); }
  if (hasEnv) { prScore += 40; prReasons.push("Ambiente detectado"); }
  if (prScore > 0) scores.push({ intent: "product_recommendation", score: prScore, reasons: prReasons });

  // product_spec_question
  let psqScore = 0;
  const psqReasons: string[] = [];
  const specPatterns = ["quantos lumens", "quantos watts", "qual kelvin", "ficha tecnica", "potencia"];
  if (specPatterns.some(p => text.includes(p))) { psqScore += 80; psqReasons.push("Padrão de especificação detectado"); }
  if (hasProd || hasContext) { psqScore += 50; psqReasons.push("Produto ou contexto"); }
  if (psqScore > 0) scores.push({ intent: "product_spec_question", score: psqScore, reasons: psqReasons });

  // explanation
  let explScore = 0;
  const explReasons: string[] = [];
  const explanationPatterns = ["o que e", "oq e", "o que é", "oq é", "como funciona", "para que serve", "qual a diferenca", "diferenca entre", "pq", "por que", "por que usar", "serve pra que"];
  if (explanationPatterns.some(p => text.includes(p))) { explScore += 80; explReasons.push("Padrão de explicação/dúvida técnica"); }
  if (text.includes("significa")) { explScore += 85; explReasons.push("Pergunta direta de significado"); }
  if (explScore > 0) scores.push({ intent: "explanation", score: explScore, reasons: explReasons });

  // courtesy
  let cScore = 0;
  const cReasons: string[] = [];
  if (courtesyPatterns.some(p => text.includes(p)) && text.length < 30) {
    cScore += 90;
    cReasons.push("Frase curta de cortesia");
  }
  if (cScore > 0) scores.push({ intent: "courtesy", score: cScore, reasons: cReasons });

  // greeting
  let gScore = 0;
  const gReasons: string[] = [];
  const words = text.split(' ');
  if (greetings.some(g => words.includes(g) || text.startsWith(g + ' '))) {
    gScore += 80;
    gReasons.push("Saudação detectada");
  }
  if (gScore > 0) scores.push({ intent: "greeting", score: gScore, reasons: gReasons });

  // developer_credit
  let dcScore = 0;
  const dcReasons: string[] = [];
  if (developerCreditPatterns.some(p => text.includes(p)) && developerTargets.some(t => text.includes(t))) {
    dcScore += 100;
    dcReasons.push("Créditos do desenvolvedor solicitados");
  }
  if (dcScore > 0) scores.push({ intent: "developer_credit", score: dcScore, reasons: dcReasons });

  // off_topic
  let otScore = 0;
  const otReasons: string[] = [];
  if (strongOffTopicTerms.some(t => text.includes(t)) && !hasProd) {
    otScore += 90;
    otReasons.push("Termo off-topic sem produto");
  }
  if (otScore > 0) scores.push({ intent: "off_topic", score: otScore, reasons: otReasons });

  // human_support / frustration
  let hsScore = 0;
  const hsReasons: string[] = [];
  const supportPatterns = ["whatsapp", "zap", "wpp", "atendente", "humano", "pessoa", "telefone", "contato"];
  if (supportPatterns.some(p => text.includes(p))) { hsScore += 90; hsReasons.push("Solicitação de suporte"); }
  if (wrongResultPatterns.some(p => text.includes(p))) { hsScore += 90; hsReasons.push("Frustração / Resultado errado"); }
  if (hsScore > 0) scores.push({ intent: "human_support", score: hsScore, reasons: hsReasons });

  // FAQ Store Hours & Location & Payment & Delivery
  if (hoursVerbs.some(v => text.includes(v)) || text.includes("horario")) {
    scores.push({ intent: "store_hours", score: 85, reasons: ["Pergunta sobre horário"] });
  }
  const locationKeywords = ["endereco", "onde fica", "localizacao", "chegar", "rota", "rua", "bairro", "instagram", "rede social"];
  if (locationKeywords.some(kw => text.includes(kw)) && (!text.includes("luz") || text.includes("endereco") || text.includes("instagram"))) {
    scores.push({ intent: "store_location", score: 85, reasons: ["Pergunta sobre localização ou redes sociais"] });
  }
  if (["pagamento", "pagar", "pix", "cartao", "boleto", "aceita"].some(kw => text.includes(kw))) {
    scores.push({ intent: "payment", score: 85, reasons: ["Pergunta sobre pagamento"] });
  }
  if (["entrega", "entregam", "frete", "retirar", "envio"].some(kw => text.includes(kw))) {
    scores.push({ intent: "delivery", score: 85, reasons: ["Pergunta sobre entrega"] });
  }

  // Quote request
  if (["orcamento", "cotacao", "quero cotar"].some(kw => text.includes(kw))) {
    scores.push({ intent: "quote_start", score: 95, reasons: ["Palavra-chave orcamento"] });
  }

  // Show more
  if (["mais", "mostrar mais", "outras", "ver todos"].some(kw => text.includes(kw)) && text.length < 30) {
    scores.push({ intent: "show_more_results", score: 80, reasons: ["Pedido para ver mais"] });
  }

  // multiple_entities
  if (entities?.products && hasTrueMultipleEntities(entities, text)) {
    if (/\b(?:e|ou|,)\b/.test(text)) {
      scores.push({ intent: "multiple_entities", score: 110, reasons: ["Múltiplos produtos detectados com conectores"] });
    } else {
      scores.push({ intent: "multiple_entities", score: 90, reasons: ["Múltiplos produtos detectados sem conectores claros"] });
    }
  }

  // product_or_technical_infrared
  if (text.includes("infravermelh") && !text.includes("serve") && !text.includes("o que e") && !text.includes("oq e") && !text.includes("diferenca")) {
    if (text.includes("luz") || hasProd) {
      scores.push({ intent: "product_or_technical_infrared", score: 150, reasons: ["Menção a infravermelho com contexto de produto"] });
    } else {
      scores.push({ intent: "product_or_technical_infrared", score: 150, reasons: ["Menção a infravermelho"] });
    }
  }

  // technical_infrared
  if (text.includes("infravermelh") && (text.includes("serve") || text.includes("o que e") || text.includes("oq e") || text.includes("diferenca"))) {
    scores.push({ intent: "technical_infrared", score: 150, reasons: ["Dúvida técnica sobre infravermelho"] });
  }

  // ask_disambiguation
  if (Object.keys(ambiguousTerms).some(term => text === term || text === `${term}?` || text === `${term}s`)) {
    scores.push({ intent: "ask_disambiguation", score: 110, reasons: ["Termo muito amplo ou ambíguo isolado"] });
  }

  return scores.sort((a, b) => b.score - a.score);
}
