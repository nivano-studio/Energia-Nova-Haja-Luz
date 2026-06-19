import { processQuery } from './chatEngine';
import type { ChatTestCase } from './types';
import { resetChatContext } from './chatContext';

const tests: ChatTestCase[] = [
  // Abreviações
  { id: 1, input: "vc tem fio?", expectedIntent: "product_search", description: "Entende 'vc tem fio'" },
  { id: 2, input: "vcs tem lampada", expectedIntent: "product_search", description: "Entende 'vcs tem lampada'" },
  { id: 3, input: "ce tem tomada", expectedIntent: "product_search", description: "Entende 'ce tem tomada'" },
  { id: 4, input: "qto custa lampada", expectedIntent: "product_price", mustInclude: ["sob consulta"], mustNotInclude: ["R$"], description: "Entende 'qto custa lampada' como consulta de preço (sob consulta)" },
  { id: 5, input: "oq e luz fria", expectedIntent: "technical_explanation", description: "Entende 'oq e luz fria'" },
  { id: 6, input: "tem zap", expectedIntent: "human_support", description: "Entende 'tem zap'" },
  { id: 7, input: "manda wpp", expectedIntent: "human_support", description: "Entende 'manda wpp'" },
  { id: 8, input: "abre hj", expectedIntent: "store_hours", description: "Entende 'abre hj'" },
  { id: 9, input: "q horas abre", expectedIntent: "store_hours", description: "Entende 'q horas abre'" },
  { id: 10, input: "q horas sao", expectedIntent: "fallback", description: "Entende 'q horas sao'" },

  // Erros
  { id: 11, input: "lanpada", expectedIntent: "product_search", description: "Corrige 'lanpada'" },
  { id: 12, input: "lampda", expectedIntent: "product_search", description: "Corrige 'lampda'" },
  { id: 13, input: "dijuntor", expectedIntent: "product_search", description: "Corrige 'dijuntor'" },
  { id: 14, input: "disjutor", expectedIntent: "product_search", description: "Corrige 'disjutor'" },
  { id: 15, input: "tomda", expectedIntent: "product_search", description: "Corrige 'tomda'" },
  { id: 16, input: "refretor", expectedIntent: "product_search", description: "Corrige 'refretor'" },
  { id: 17, input: "plafom", expectedIntent: "product_search", description: "Corrige 'plafom'" },
  { id: 18, input: "fiu", expectedIntent: "product_search", description: "Corrige 'fiu'" },
  { id: 19, input: "cabu", expectedIntent: "ask_disambiguation", description: "Corrige 'cabu'" },

  // Luz infravermelha
  { id: 20, input: "tem luz infravermelha", expectedIntent: "product_or_technical_infrared", description: "Entende 'tem luz infravermelha'" },
  { id: 21, input: "vc tem luz infravermelha", expectedIntent: "product_or_technical_infrared", description: "Entende 'vc tem luz infravermelha'" },
  { id: 22, input: "vcs tem infravermelho", expectedIntent: "product_or_technical_infrared", description: "Entende 'vcs tem infravermelho'" },
  { id: 23, input: "o que e luz infravermelha", expectedIntent: "technical_infrared", description: "Entende 'o que e luz infravermelha'" },
  { id: 24, input: "luz infravermelha serve pra que", expectedIntent: "technical_infrared", description: "Entende 'luz infravermelha serve pra que'" },

  // Saudação + produto
  { id: 25, input: "oi vc tem fio", expectedIntent: "product_search", description: "Ignora saudacao e vai para produto" },
  { id: 26, input: "oii tem lampada", expectedIntent: "product_search", description: "Ignora saudacao e vai para produto" },
  { id: 27, input: "hello tem tomada", expectedIntent: "product_search", description: "Ignora saudacao e vai para produto" },
  { id: 28, input: "bom dia vcs tem disjuntor", expectedIntent: "product_search", description: "Ignora saudacao e vai para produto" },
  { id: 29, input: "eai vende refletor", expectedIntent: "product_search", description: "Ignora saudacao e vai para produto" },
  { id: 30, input: "opa preciso de cabo", expectedIntent: "product_search", description: "Ignora saudacao e vai para produto" },

  // Regressões
  {
    id: 999,
    input: "vc tem luz infravermelha?",
    expectedIntent: "product_or_technical_infrared",
    mustInclude: ["infravermelho"],
    mustNotInclude: ["endereco", "localizacao", "rua", "bairro", "maps"],
    description: "REGRESSÃO: vc tem luz infravermelha nunca deve cair em localização"
  },
  {
    id: 1000,
    input: "vc tem fio?",
    expectedIntent: "product_search",
    mustNotInclude: ["nao entendi"],
    description: "REGRESSÃO: vc tem fio deve ser entendido como vocês têm fio"
  },
  {
    id: 1001,
    input: "oii tem lampada?",
    expectedIntent: "product_search",
    mustNotInclude: ["seja bem vindo"],
    description: "REGRESSÃO: saudação + produto não deve parar na saudação"
  },
  {
    id: 1002,
    input: "q horas sao",
    mustNotInclude: ["funcionamento", "abre", "fecha"],
    description: "REGRESSÃO: hora real não é horário da loja"
  },
  {
    id: 1003,
    input: "isso não é lâmpada",
    expectedIntent: "human_support",
    description: "V5.0: Deve acionar correção de erro"
  },
  {
    id: 1004,
    input: "lampada ou fio",
    expectedIntent: "multiple_entities",
    description: "V5.0: Deve detectar multiplas entidades"
  },
  {
    id: 1005,
    input: "qual horário de domingo",
    expectedIntent: "store_hours",
    description: "V5.0: Horário de domingo"
  },
  {
    id: 1006,
    input: "vende ferramenta",
    expectedIntent: "product_search",
    description: "V5.0: Busca ferramenta limitando categoria"
  },
  {
    id: 1007,
    input: "onde fica a loja",
    expectedIntent: "store_location",
    description: "V5.0: Localização da loja"
  },
  {
    id: 1008,
    input: "como voceesta?",
    expectedIntent: "courtesy",
    mustNotInclude: ["Ainda falando", "catálogo", "produto"],
    description: "V7.2: como voceesta? vira courtesy"
  },
  {
    id: 1009,
    input: "comovoceesta?",
    expectedIntent: "courtesy",
    mustNotInclude: ["Ainda falando"],
    description: "V7.2: comovoceesta? vira courtesy"
  },
  {
    id: 1010,
    input: "qual as melhores lampadas?",
    expectedIntent: "product_recommendation",
    mustInclude: ["melhores opções"],
    mustNotInclude: ["Não encontrei esse item"],
    description: "V7.2: qual as melhores lampadas vira recomendação"
  },
  {
    id: 1011,
    input: "lampadas?",
    expectedIntent: "product_search",
    mustNotInclude: ["Não encontrei esse item"],
    description: "V7.2: lampadas aciona guided_loose"
  },
  {
    id: 1012,
    input: "lâmpadas?",
    expectedIntent: "product_search",
    mustNotInclude: ["Não encontrei esse item"],
    description: "V7.2: lâmpadas aciona guided_loose"
  },
  {
    id: 1013,
    input: "luz",
    expectedIntent: "ask_disambiguation",
    mustNotInclude: ["R$"],
    description: "V7.2: luz aciona guided_loose sem preços"
  },
  {
    id: 1014,
    input: "qto custa lampada?",
    expectedIntent: "product_price",
    mustInclude: ["sob consulta"],
    mustNotInclude: ["R$", "5.99", "7.49", "9.90"],
    description: "V7.2: product_price responde valor sob consulta"
  },
  {
    id: 1015,
    input: "tem lampada?",
    expectedIntent: "product_search",
    mustNotInclude: ["R$"],
    description: "V7.2: sem preco"
  },
  // NOVOS TESTES V9.2
  { id: 1016, input: "lampada e tomada", expectedIntent: "multiple_entities", description: "V9.2: Deve barrar dois produtos" },
  { id: 1017, input: "tem fio ou disjuntor?", expectedIntent: "multiple_entities", description: "V9.2: Deve barrar produtos separados por ou" },
  { id: 1018, input: "quero lampada, tomada e fio", expectedIntent: "multiple_entities", description: "V9.2: Deve barrar lista de produtos" },
  {
    id: 1019,
    input: "luz",
    expectedIntent: "ask_disambiguation",
    description: "V9.2: 'luz' sozinho é muito ambíguo"
  },
  {
    id: 1020,
    input: "chave",
    expectedIntent: "ask_disambiguation",
    description: "V9.2: 'chave' sozinho é ambíguo"
  },
  { id: 1021, input: "20", expectedIntent: "fallback", description: "V9.2: Numero sozinho deve ser ignorado ou tratar como lixo" },
  { id: 1022, input: "127", expectedIntent: "fallback", description: "V9.2: Voltagem solta deve ser ignorada se não tiver contexto" },
  { id: 1023, input: "220v", expectedIntent: "fallback", description: "V9.2: Voltagem solta (v2)" },
  { id: 1024, input: "qual seu instagram", expectedIntent: "store_location", mustInclude: ["instagram"], description: "V9.2: Pergunta de instagram -> store_location (ou criar intent de instagram)" },
  { id: 1025, input: "fita", expectedIntent: "product_search", description: "V9.2: Fita deve virar fita isolante" },
  { id: 1026, input: "bocau", expectedIntent: "product_search", description: "V9.2: Bocau deve virar suporte" },
  { id: 1027, input: "quadro", expectedIntent: "product_search", description: "V9.2: Quadro deve virar quadro_energia" },
  { id: 1028, input: "dijumtore", expectedIntent: "product_search", description: "V15: dijumtore phonetic match to disjuntor" }
];

function runTests() {
  console.log("Iniciando testes da IA...");
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    resetChatContext();
    const result = processQuery(test.input);
    const textLower = result.text.toLowerCase();

    let isFail = false;
    const failReasons: string[] = [];

    if (test.expectedIntent && result.intent !== test.expectedIntent) {
      isFail = true;
      failReasons.push(`Esperado intent '${test.expectedIntent}', mas recebeu '${result.intent}'`);
    }

    if (test.mustInclude) {
      for (const word of test.mustInclude) {
        if (!textLower.includes(word.toLowerCase())) {
          isFail = true;
          failReasons.push(`Resposta não incluiu a palavra obrigatória: '${word}'`);
        }
      }
    }

    if (test.mustNotInclude) {
      for (const word of test.mustNotInclude) {
        if (textLower.includes(word.toLowerCase())) {
          isFail = true;
          failReasons.push(`Resposta incluiu a palavra proibida: '${word}'`);
        }
      }
    }

    if (isFail) {
      failed++;
      console.error(`❌ FALHOU [${test.id}]: ${test.description}`);
      console.error(`   Input: "${test.input}"`);
      failReasons.forEach(r => console.error(`   - ${r}`));
    } else {
      passed++;
      console.log(`✅ PASSOU [${test.id}]: ${test.description}`);
    }
  }

  // Generate automated greeting+product tests
  const greetings = ["oi", "oii", "ola", "opa", "eai", "hello", "bom dia"];
  const products = ["fio", "lampada", "tomada", "disjuntor", "refletor", "plafon"];
  const buyingPhrases = ["tem", "vc tem", "vcs tem", "quero", "preciso de", "vende"];

  let generatedPassed = 0;
  let generatedFailed = 0;

  for (const g of greetings) {
    for (const b of buyingPhrases) {
      for (const p of products) {
        resetChatContext();
        const input = `${g} ${b} ${p}`;
        const result = processQuery(input);
        if (result.intent !== 'product_search') {
          generatedFailed++;
          console.error(`❌ FALHOU GERADO: "${input}" -> Esperado product_search, recebeu ${result.intent}`);
        } else {
          generatedPassed++;
        }
      }
    }
  }

  // Context tests
  console.log("\nExecutando testes de contexto...");
  resetChatContext();
  processQuery("quero uma lampada para quarto");
  const ctx1b = processQuery("qual melhor?");
  if (ctx1b.intent === "product_recommendation" || ctx1b.intent === "context_product_recommendation") {
    console.log(`✅ PASSOU: Contexto 1 (lampada + qual melhor) -> ${ctx1b.intent}`);
    passed++;
  } else {
    console.error(`❌ FALHOU: Contexto 1 -> Esperado product_recommendation, recebeu ${ctx1b.intent}`);
    failed++;
  }

  // Ver mais test
  resetChatContext();
  processQuery("quero lampada");
  const ctx3 = processQuery("ver mais");
  if (ctx3.intent === "show_more_results") {
    console.log(`✅ PASSOU: Contexto 3 (ver mais resultados) -> ${ctx3.intent}`);
    passed++;
  } else {
    console.error(`❌ FALHOU: Contexto 3 -> Esperado show_more_results, recebeu ${ctx3.intent}`);
    failed++;
  }

  resetChatContext();
  processQuery("preciso de fio para chuveiro");
  const ctx2 = processQuery("5500w");
  if (ctx2.intent === "electrical_safety") {
    console.log(`✅ PASSOU: Contexto 2 (chuveiro + potência) -> ${ctx2.intent}`);
    passed++;
  } else {
    console.error(`❌ FALHOU: Contexto 2 -> Esperado electrical_safety, recebeu ${ctx2.intent}`);
    failed++;
  }

  // Pronoun context test
  resetChatContext();
  processQuery("tem tomada?");
  const ctx4 = processQuery("quanto custa ela?");
  if (ctx4.intent === "product_price" && ctx4.entities?.products?.includes("tomada")) {
    console.log(`✅ PASSOU: Contexto 4 (pronomes: tomada + quanto custa ela) -> ${ctx4.intent}`);
    passed++;
  } else {
    console.error(`❌ FALHOU: Contexto 4 -> Esperado product_price com entidade tomada, recebeu ${ctx4.intent} com entidades ${JSON.stringify(ctx4.entities)}`);
    failed++;
  }

  console.log(`\n--- RESULTADO FINAL ---`);
  console.log(`Básicos: ${passed} passaram, ${failed} falharam.`);
  console.log(`Gerados: ${generatedPassed} passaram, ${generatedFailed} falharam.`);

  if (failed > 0 || generatedFailed > 0) {
    throw new Error("Testes falharam.");
  }
}

// execute tests
runTests();
