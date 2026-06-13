import { useState } from 'react';
import { ChevronDown, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Como funciona o carrinho e como faço para solicitar o orçamento?",
    answer: "Adicione os materiais elétricos ou ferramentas que você precisa ao seu carrinho. Quando estiver pronto, clique no ícone do carrinho e depois no botão **'Solicitar Orçamento Agora'**. Você será direcionado para o nosso WhatsApp com a lista completa do seu pedido para que possamos enviar os preços, verificar a disponibilidade e combinar a retirada em nossa loja."
  },
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Aceitamos pagamentos via PIX, cartões de crédito e débito (com opção de parcelamento), dinheiro e faturamento para empresas (sujeito a análise cadastral). Tudo pode ser combinado diretamente na finalização do seu orçamento pelo WhatsApp."
  },
  {
    question: "Deseja algum produto que não encontrou no site?",
    answer: "Caso tenha algum produto que deseja e não está no site, entre em contato direto com o nosso **WhatsApp**. Nossa equipe verificará a disponibilidade em nossa loja física e incluirá o item no seu orçamento de forma rápida!"
  },
  {
    question: "A loja faz entregas? Como funciona o frete?",
    answer: "Sim! Fazemos entregas em **Mata Roma** e em todas as regiões vizinhas. O prazo e valores de frete são combinados diretamente pelo WhatsApp no fechamento do seu orçamento. Você também pode optar por **retirar os produtos na loja física**."
  },
  {
    question: "Os produtos são originais e possuem garantia?",
    answer: "Todos os nossos produtos são **100% originais**, comprados diretamente de distribuidores oficiais, com nota fiscal e garantia de fábrica. A **Haja Luz** foi fundada em **2014** e é referência em confiabilidade em Mata Roma - MA."
  }
];

const WHATSAPP_URL = 'https://wa.me/5598984542937?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Haja%20Luz%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento!';

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full bg-gradient-to-b from-[#f3f4f6] to-[#EEF0F5] py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-[800px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#1C2978]/5 border border-[#1C2978]/10 text-[#1C2978] px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            Perguntas Frequentes
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#1C2978] tracking-tight font-display">
            Dúvidas? A gente responde!
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-2 max-w-md mx-auto">
            Confira as respostas para as perguntas mais comuns dos nossos clientes.
          </p>
        </div>

        {/* Accordion FAQ Cards */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'border-[#1C2978]/20 shadow-[0_8px_30px_rgba(28,41,120,0.06)]'
                    : 'border-slate-100 hover:border-slate-200 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
                >
                  <span className={`text-[13px] md:text-sm font-bold transition-colors duration-300 leading-snug ${
                    isExpanded ? 'text-[#1C2978]' : 'text-slate-700 group-hover:text-[#1C2978]'
                  }`}>
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-lg transition-all duration-300 shrink-0 ${
                    isExpanded ? 'bg-[#1C2978]/5 text-[#1C2978] rotate-180' : 'bg-slate-50 text-slate-400 group-hover:text-[#1C2978]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 md:px-6 md:pb-6 border-t border-slate-50">
                        <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed font-medium">
                          {item.answer.split('**').map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className="text-[#1C2978] font-bold">{part}</strong> : part
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Help CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-gradient-to-br from-[#1C2978] to-[#141F59] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left border border-white/5"
        >
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <AlertCircle className="w-7 h-7 text-[#FFD200]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm md:text-base">Ainda tem dúvidas?</h3>
            <p className="text-blue-200 text-xs md:text-sm font-medium mt-1 leading-relaxed">
              Nossa equipe está disponível no WhatsApp para ajudar com listas de materiais, orçamentos personalizados e muito mais!
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-6 py-3 rounded-xl text-xs md:text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 whitespace-nowrap"
          >
            Falar no WhatsApp
          </a>
        </motion.div>

      </div>
    </section>
  );
}
