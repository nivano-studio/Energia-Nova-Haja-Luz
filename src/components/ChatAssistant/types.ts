import type { Product } from '../../data/products';

export interface ExtractedEntities {
  products?: string[];
  category?: string;
  environment?: string;
  usage?: string;
  powerWatts?: number;
  voltage?: number;
  currentAmps?: number;
  colorTemperatureKelvin?: number;
  color?: string;
  quantity?: number;
  paymentMethod?: string;
  channel?: string;
  storeInfoType?: string;
  type?: string;
  hasIsolatedAttribute?: boolean;
}

export interface UnderstandingResult {
  originalInput: string;
  cleanInput: string;
  correctedInput: string;
  knownEntities: string[];
  unknownTokens: string[];
  ignoredNoiseTokens: string[];
  probableMeaning: string;
  probableCategory: string;
  intentScores: Record<string, number>;
  winningIntent: string; // includes attribute_refinement, product_not_found, product_search_with_nearest_match
  secondIntent: string;
  confidence: number;
  ambiguityLevel: 'none' | 'low' | 'high';
  contextUsed: boolean;
  contextAllowed: boolean;
  contextReason: string;
  shouldAskClarification: boolean;
  clarificationQuestion: string | null;
  validationWarnings: string[];
  entities: ExtractedEntities;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productSearchDebug?: Record<string, any>;
}

export type EntityMatch = {
  value: string;
  type: "product" | "environment" | "usage" | "unit" | "store_info" | "ambiguous" | "technical" | "attribute";
  confidence: number;
  source: "exact" | "synonym" | "typo" | "fuzzy" | "context";
};

export type IntentScore = {
  intent: string;
  score: number;
  reasons: string[];
};

export type ProductMatch = {
  product: Product;
  score: number;
  reasons: string[];
};

export type ChatAction = {
  type: "category" | "show_more" | "whatsapp" | "quote" | "product_search" | "link";
  label: string;
  payload?: Record<string, unknown>;
};

export type ChatResponse = {
  text: string;
  products?: Product[];
  whatsappBtn?: boolean;
  actions?: ChatAction[];
  suggestedQuestions?: string[];
  intent?: string;
  confidence?: number;
  entities?: ExtractedEntities;
  entityMatches?: EntityMatch[];
  debug?: {
    original?: string;
    clean?: string;
    normalizedSteps?: string[];
    matchedRules?: string[];
    intentScores?: IntentScore[];
    winner?: string;
    ignored?: string[];
  };
};

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: Product[];
  whatsappBtn?: boolean;
  suggestedQuestions?: string[];
  actions?: ChatAction[];
}

export type LastSearchState = {
  query: string;
  category: string | null;
  entities: ExtractedEntities;
  shownProductIds: string[];
  offset: number;
  totalMatches: number;
  timestamp: number;
};

export type ChatContextState = {
  hardContext: {
    active: boolean;
    flow: "electrical_sizing" | "lamp_recommendation" | "quote" | "product_detail" | "guided_search" | "safety_guided" | "loose_wire" | "loose_lamp" | null;
    expected: "voltage" | "power" | "distance" | "environment" | "quantity" | "usage" | "confirmation" | null;
    collected: Record<string, unknown>;
    startedAt: number;
    stepCount: number;
  };
  softContext: {
    active: boolean;
    subject: string | null;
    category: string | null;
    entities: ExtractedEntities;
    updatedAt: number;
    contextStrength: 'none' | 'weak' | 'medium' | 'strong';
  };
  lastSearch: LastSearchState | null;
  messageCountSinceLastSubject: number;
};

export type ChatTestCase = {
  id: number;
  input: string;
  expectedIntent?: string;
  mustInclude?: string[];
  mustNotInclude?: string[];
  shouldHaveProducts?: boolean;
  shouldHaveWhatsapp?: boolean;
  description: string;
};

export type ConversationTestCase = {
  id: number;
  messages: string[];
  expectedFinalIntent: string;
  mustInclude?: string[];
  description: string;
};
