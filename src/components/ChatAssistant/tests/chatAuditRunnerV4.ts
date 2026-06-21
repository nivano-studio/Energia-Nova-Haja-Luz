import { processQuery } from '../chatEngine';
import { chatContext, resetChatContext } from '../chatContext';
const testCases = [
  {
    name: '1. "oie" -> greeting/courtesy. Não apagar contexto',
    run: () => {
      resetChatContext();
      processQuery('lampada'); // set context
      const res = processQuery('oie');
      return {
        passed: (res.intent === 'greeting' || res.intent === 'courtesy') && chatContext.softContext.active === true,
        intent: res.intent,
        details: 'Cortesia não apaga contexto'
      };
    }
  },
  {
    name: '2. "como esta?" -> courtesy. Não virar produto',
    run: () => {
      resetChatContext();
      processQuery('tomada');
      const res = processQuery('como esta?');
      return {
        passed: res.intent === 'courtesy',
        intent: res.intent,
        details: 'Cortesia não vira produto'
      };
    }
  },
  {
    name: '3. "me fala qual melhor lampada para minah cozinha?"',
    run: () => {
      resetChatContext();
      const res = processQuery('me fala qual melhor lampada para minah cozinha?');
      return {
        passed: res.intent === 'product_recommendation',
        intent: res.intent,
        details: 'Ambiente cozinha detectado'
      };
    }
  },
  {
    name: '4. "preciso de uma tomada para meu escritorio"',
    run: () => {
      resetChatContext();
      const res = processQuery('preciso de uma tomada para meu escritorio');
      return {
        passed: res.intent === 'product_recommendation' || res.intent === 'product_search',
        intent: res.intent,
        details: 'Recomendação de tomada'
      };
    }
  },
  {
    name: '5. "uma que seja usb"',
    run: () => {
      resetChatContext();
      processQuery('tomada');
      const res = processQuery('uma que seja usb');
      return {
        passed: res.intent === 'attribute_refinement' || res.intent === 'context_product_recommendation',
        intent: res.intent,
        details: 'Refinamento de atributo USB'
      };
    }
  },
  {
    name: '6. "uma tomada que seja para usb tem?"',
    run: () => {
      resetChatContext();
      const res = processQuery('uma tomada que seja para usb tem?');
      return {
        passed: res.intent === 'product_search',
        intent: res.intent,
        details: 'Busca direta de tomada USB'
      };
    }
  },
  {
    name: '7. "tem facão?" -> product_not_found',
    run: () => {
      resetChatContext();
      const res = processQuery('tem facão?');
      return {
        passed: res.intent === 'product_not_found',
        intent: res.intent,
        details: 'Não pode ser price, deve ser not found'
      };
    }
  },
  {
    name: '8. "me flaa tem cabo 2mm?" -> nearest_match',
    run: () => {
      resetChatContext();
      const res = processQuery('me flaa tem cabo 2mm?');
      return {
        passed: res.intent === 'product_search_with_nearest_match',
        intent: res.intent,
        details: 'Detectar cabo 2mm'
      };
    }
  },
  {
    name: '9. "tem cabo 2mm" -> nearest_match',
    run: () => {
      resetChatContext();
      const res = processQuery('tem cabo 2mm');
      return {
        passed: res.intent === 'product_search_with_nearest_match',
        intent: res.intent,
        details: 'Mesmo que o de cima'
      };
    }
  },
  {
    name: '10. "tem mais alguma?" -> show_more_results',
    run: () => {
      resetChatContext();
      processQuery('lampada led');
      const res = processQuery('tem mais alguma?');
      return {
        passed: res.intent === 'show_more_results',
        intent: res.intent,
        details: 'Mostrar mais resultados'
      };
    }
  },
  {
    name: '11. "tava querendo um vermelho tem?" (contexto cabos)',
    run: () => {
      resetChatContext();
      processQuery('cabo');
      const res = processQuery('tava querendo um vermelho tem?');
      return {
        passed: res.intent === 'attribute_refinement' || res.intent === 'context_product_recommendation',
        intent: res.intent,
        details: 'Refinamento de atributo cor'
      };
    }
  },
  {
    name: '12. "tem verde?" (contexto cabos)',
    run: () => {
      resetChatContext();
      processQuery('cabo flexivel');
      const res = processQuery('tem verde?');
      return {
        passed: res.intent === 'attribute_refinement' || res.intent === 'context_product_recommendation',
        intent: res.intent,
        details: 'Refinamento de cor verde'
      };
    }
  },
  {
    name: '13. "tava querendo um cabo verde?"',
    run: () => {
      resetChatContext();
      const res = processQuery('tava querendo um cabo verde?');
      return {
        passed: res.intent === 'product_search',
        intent: res.intent,
        details: 'Busca direta por cabo verde'
      };
    }
  }
];

let passed = 0;
for (const tc of testCases) {
  const result = tc.run();
  if (result.passed) {
    passed++;
    console.log(`✅ PASS: ${tc.name} (Intent: ${result.intent})`);
  } else {
    console.log(`❌ FAIL: ${tc.name} (Expected proper intent, got ${result.intent})`);
  }
}

console.log(`\\nAudit V4 Completed: ${passed}/${testCases.length} tests passed.`);
