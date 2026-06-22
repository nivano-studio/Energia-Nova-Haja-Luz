import { useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, Send, Trash2, PackageOpen } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { WHATSAPP_NUMBER } from '../../data/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handleSendToWhatsApp = () => {
    if (items.length === 0) return;
    
    let message = "Olá! Gostaria de fazer um orçamento para os seguintes produtos:\n\n";
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name}\n`;
    });
    
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    clearCart();
    setIsCartOpen(false);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[11000] flex justify-end pointer-events-none">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#1C2978]/40 backdrop-blur-md pointer-events-auto touch-none"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '110%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '110%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[500px] bg-[#F8FAFC] h-full flex flex-col overflow-hidden pointer-events-auto md:m-4 md:my-4 md:mr-4 md:rounded-3xl md:h-auto md:max-h-[calc(100vh-32px)]"
            style={{ 
              boxShadow: '-10px 0 60px rgba(0, 0, 0, 0.15), -2px 0 10px rgba(0, 0, 0, 0.05)' 
            }}
          >
            {/* Header */}
            <div className="bg-[#1C2978] text-white px-6 py-5 md:rounded-t-3xl relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#1C2978]/20 rounded-xl flex items-center justify-center border border-[#1C2978]/30">
                    <ShoppingCart className="w-5 h-5 text-[#FFD200]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display tracking-tight">Meu Orçamento</h2>
                    <p className="text-blue-300 text-xs font-medium mt-0.5">
                      {items.length === 0 ? 'Nenhum item adicionado' : `${items.length} produto${items.length > 1 ? 's' : ''} · ${totalItems} unid.`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/70 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100"
                  >
                    <PackageOpen className="w-12 h-12 text-slate-300" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-[#1C2978] mb-2">Sua lista está vazia</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-[240px] mx-auto leading-relaxed">
                    Explore nossos produtos e adicione itens para solicitar um orçamento.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#1C2978] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:shadow-lg active:scale-95 text-sm"
                  >
                    Continuar explorando
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item.product.id} 
                        className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-xl p-2 flex items-center justify-center shrink-0 border border-slate-100/50">
                          <img src={item.product.image} alt={item.product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-[13px] text-[#1C2978] leading-snug line-clamp-2">
                              {item.product.name}
                            </h4>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="flex-shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              title="Remover produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qtd</span>
                            
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-0.5">
                              <button 
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 hover:bg-blue-50 hover:text-[#1C2978] text-slate-500 transition-colors active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-bold w-8 text-center text-[#1C2978]">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 hover:bg-blue-50 hover:text-[#1C2978] text-slate-500 transition-colors active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 bg-white border-t border-slate-100 md:rounded-b-3xl relative z-10">
                
                <div className="flex justify-between items-center mb-4 bg-[#F5F7FB] p-4 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-medium text-sm">Total de Itens</span>
                  <span className="text-lg font-bold text-[#1C2978]">{totalItems} unid.</span>
                </div>

                <button 
                  onClick={handleSendToWhatsApp}
                  className="group relative w-full overflow-hidden bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-lg shadow-[#25D366]/25 active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <Send className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 text-[15px]">Solicitar Orçamento Agora</span>
                </button>
                
                <p className="text-center text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                  Atendimento 100% humano via WhatsApp
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
