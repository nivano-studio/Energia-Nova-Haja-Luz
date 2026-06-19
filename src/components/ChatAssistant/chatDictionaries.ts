import abbreviations from '../../../data/chat-dictionaries/abbreviations.json';
import typos from '../../../data/chat-dictionaries/typos.json';
import synonymsJson from '../../../data/chat-dictionaries/synonyms.json';
import productsList from '../../../data/chat-dictionaries/products.json';
import technicalTerms from '../../../data/chat-dictionaries/technical_terms.json';
import phraseCorrections from '../../../data/chat-dictionaries/phrase_corrections.json';
import offTopicTerms from '../../../data/chat-dictionaries/off_topic_terms.json';

export const requiredCorrections: Record<string, string> = {
  // humano/social
  "bom tarde": "boa tarde",
  "boa tard": "boa tarde",
  "boatarde": "boa tarde",
  "bomdia": "bom dia",
  "boanoite": "boa noite",
  "voceesta": "voce esta",
  "comovoceesta": "como voce esta",
  "tudobem": "tudo bem",
  "tudobom": "tudo bom",

  // gerais
  "minah": "minha",
  "nen": "nem",
  "pra": "para",
  "pro": "para o",
  "qto": "quanto",
  "qnt": "quanto",
  "oq": "o que",
  "vc": "voce",
  "vcs": "voces",
  "ce": "voce",

  // redes sociais
  "istagram": "instagram",
  "instagran": "instagram",
  "instagarm": "instagram",
  "insta": "instagram",
  "ig": "instagram",

  // iluminação
  "lanpada": "lampada",
  "lampda": "lampada",
  "lmapada": "lampada",
  "lanspada": "lampada",
  "lapada": "lampada",
  "lampadas": "lampada",
  "luzs": "luz",
  "lus": "luz",
  "luiz": "luz",
  "luis": "luz",
  "plafom": "plafon",
  "refretor": "refletor",

  // ferramentas
  "ferramneta": "ferramenta",
  "ferrameta": "ferramenta",
  "ferramnta": "ferramenta",
  "feramenta": "ferramenta",
  "alicati": "alicate",

  // ferragens
  "parafusus": "parafuso",
  "parafusos": "parafuso",
  "parafuza": "parafuso",
  "parafuzo": "parafuso",
  "parafuco": "parafuso",
  "parafuço": "parafuso",
  "parafus": "parafuso",
  "buxa": "bucha",
  "buchas": "bucha",
  "pregos": "prego",

  // elétrica
  "tomda": "tomada",
  "dijuntor": "disjuntor",
  "disjutor": "disjuntor",
  "fiu": "fio",
  "cabu": "cabo",
  "chuvero": "chuveiro",
  "shuveiro": "chuveiro",
  "pv": "pvc"
};

export const repeatedCorrections: Record<string, string> = {
  "oii": "oi",
  "oiii": "oi",
  "oiie": "oi",
  "oiee": "oie",
  "olaa": "ola",
  "opaa": "opa",
  "eaii": "eai",
  "helloo": "hello",
  "bom diaa": "bom dia",
  "boa tardee": "boa tarde",
  "boa noitee": "boa noite",
  "obgg": "obrigado",
  "vlww": "valeu",
  "simmm": "sim",
  "naoo": "nao"
};

export const slangDictionary: Record<string, string> = abbreviations;
export const electricalTypos: Record<string, string> = typos;

export const probableCorrections: Record<string, string> = {
  "fita": "fita isolante", 
  "quadro": "quadro de energia",
  "caixinha": "caixa de passagem",
  "bocal": "suporte para lampada",
  "bocau": "suporte para lampada",
  "conector": "conector eletrico"
};

export const synonyms: Record<string, string[]> = synonymsJson;
export const productAndTechnicalKeywords: string[] = [
  ...productsList,
  ...technicalTerms,
  "eletroduto", "conduite", "quadro de energia", "aterramento", "extensao", "benjamin", "adaptador", "filtro de linha", "tomada inteligente", "campainha", "interruptor paralelo", "interruptor simples", "interruptor duplo",
  "ferramenta", "ferramentas", "alicate", "chave", "multimetro", "fita isolante"
];

export const technicalProtectedTerms: string[] = technicalTerms;
export const strongOffTopicTerms: string[] = offTopicTerms;
export const joinedWordsCorrections: Record<string, string> = phraseCorrections;

export const fuzzyVocabulary: string[] = [
  ...productAndTechnicalKeywords,
  "iluminacao", "ferramentas", "ventiladores", "disjuntores", "cabos",
  "oi", "ola", "opa", "bom dia", "boa tarde", "boa noite",
  "tem", "vende", "quero", "preciso", "quanto", "custa", "valor", "preco", "melhor", "recomenda",
  "quarto", "sala", "cozinha", "banheiro", "garagem", "jardim", "chale", "chalé"
];
