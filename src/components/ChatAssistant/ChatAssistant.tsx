import { useState, useEffect, useRef } from 'react';
import { Sparkle, Send, X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { WHATSAPP_URL } from '../../data/constants';
import { processQuery } from './chatEngine';
import type { Message, ChatAction } from './types';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { addToCart } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageIdRef = useRef(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Olá! Sou a **Inteligência Artificial da Energia Nova Haja Luz**! 💡\n\nEstou aqui para tirar suas dúvidas sobre materiais elétricos e ajudar no seu projeto. Como posso te ajudar hoje?',
    }
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show tooltip invite after 3 seconds (once per session)
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem('hasSeenAITooltip');
    if (hasSeenTooltip) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
      sessionStorage.setItem('hasSeenAITooltip', 'true');
      const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
      return () => clearTimeout(hideTimer);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Prevent background scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'show_more') {
      sendMessage('ver mais');
    } else if (action.type === 'category') {
      const catSlug = action.payload?.category;
      if (catSlug) {
        window.dispatchEvent(new CustomEvent('select-product', { detail: { category: catSlug } }));
        setIsOpen(false);
      }
    }
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    messageIdRef.current += 1;
    // Add user message
    const userMsg: Message = {
      id: `user-${messageIdRef.current}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and typing
    setTimeout(() => {
      const response = processQuery(textToSend);
      messageIdRef.current += 1;
      const aiMsg: Message = {
        id: `ai-${messageIdRef.current}`,
        sender: 'ai',
        text: response.text,
        products: response.products,
        whatsappBtn: response.whatsappBtn,
        suggestedQuestions: response.suggestedQuestions,
        actions: response.actions,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      <div className="fixed bottom-24 right-4 md:right-6 lg:right-16 z-50 flex flex-col items-end">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mb-4 bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-xl relative border border-gray-100 max-w-[200px]"
            >
              <div className="text-sm font-medium">Precisa de ajuda com materiais elétricos? ⚡</div>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(true)}
          className={`
            bg-primary-600 text-white w-14 h-14 rounded-full shadow-2xl 
            hover:bg-primary-700 hover:scale-110 active:scale-95
            transition-all duration-300 flex items-center justify-center
            group relative
            ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
          `}
          aria-label="Abrir Assistente Virtual"
        >
          <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-20"></div>
          <Sparkle className="w-6 h-6 text-white fill-current group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="fixed md:bottom-24 md:right-6 lg:right-16 bottom-0 right-0 w-full md:w-[360px] h-[100dvh] md:h-[calc(100dvh-130px)] md:max-h-[550px] bg-white md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
                  <Sparkle className="w-5 h-5 text-white fill-current" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-700"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Assistente Energia Nova Haja Luz</h3>
                  <p className="text-primary-100 text-xs font-medium">Online agora</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Fechar Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 relative">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
                      ${message.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                      }
                    `}
                  >
                    {/* Render message text with simple markdown support for bold */}
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {message.text.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className={message.sender === 'user' ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{part}</strong> : part
                      )}
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Render Products if any */}
                  {message.products && message.products.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex gap-2 overflow-x-auto w-full pb-2 snap-x"
                    >
                      {message.products.map(product => (
                        <div key={product.id} className="min-w-[200px] bg-white rounded-xl border border-gray-100 shadow-sm p-3 snap-start shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-24 object-contain mb-2 rounded-lg" />
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-2">{product.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 italic">Valor sob consulta</p>
                          <button
                            onClick={() => addToCart(product)}
                            className="mt-2 w-full bg-gray-50 hover:bg-primary-50 text-primary-600 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 border border-gray-100"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Adicionar ao orçamento
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Render WhatsApp Button if needed */}
                  {message.whatsappBtn && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 w-full max-w-[85%]"
                    >
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md shadow-green-500/20 active:scale-95"
                      >
                        Falar com Atendente
                      </a>
                    </motion.div>
                  )}

                  {/* Render General Actions (e.g. show_more, category) */}
                  {message.actions && message.actions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex flex-col gap-2 w-full max-w-[85%]"
                    >
                      {message.actions
                        .filter(action => action.type === 'show_more' || action.type === 'category')
                        .map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className={`
                              w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all border text-center active:scale-95
                              ${action.type === 'show_more'
                                ? 'bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-100'
                                : 'bg-[#1C2978] hover:bg-[#152060] text-white border-transparent shadow-md shadow-blue-500/10'
                              }
                            `}
                          >
                            {action.label}
                          </button>
                        ))
                      }
                    </motion.div>
                  )}

                  {/* Render Suggested Questions */}
                  {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      {message.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(q)}
                          className="bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border border-primary-100 text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm flex items-center gap-1.5">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(inputText);
                }}
                className="flex gap-2 relative"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700 text-sm placeholder-gray-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-5 h-5 -ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400 font-medium">As respostas são geradas por IA e podem conter imprecisões.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
