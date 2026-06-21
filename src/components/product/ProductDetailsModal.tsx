import { X, ShoppingCart, Plus, Minus, ShieldCheck, Truck, Zap, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Product } from '../../data/products';
import { useCart } from '../../contexts/CartContext';
import { motion } from 'framer-motion';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
}

const getProductDescription = (product: Product): string => {
  if (product.description) return product.description;
  
  const categoryDesc: Record<string, string> = {
    'iluminacao': 'Solução de iluminação de alta eficiência, projetada para proporcionar excelente fluxo luminoso, economia de energia e longa durabilidade. Perfeito para criar um ambiente moderno, seguro e bem iluminado.',
    'fios-cabos': 'Condutor elétrico de alto padrão de qualidade, ideal para instalações internas e fixas de baixa tensão. Fabricado sob as mais rígidas normas técnicas nacionais para assegurar excelente condutividade e isolamento seguro.',
    'tomadas': 'Acessório de instalação elétrica com design clean, discreto e moderno. Produzido em termoplástico de engenharia de alta durabilidade com aditivo anti-UV, garantindo conexões firmes e seguras.',
    'disjuntores': 'Dispositivo de segurança essencial para proteção de circuitos elétricos contra sobrecargas e curtos-circuitos. Alta velocidade de disparo térmico e magnético para assegurar a proteção de pessoas e patrimônio.',
    'ferramentas': 'Ferramenta de padrão profissional fabricada com liga de alta resistência. Ergonomia aprimorada para proporcionar precisão, conforto e máxima durabilidade em trabalhos pesados de montagem e manutenção.',
    'ventiladores': 'Ventilador e climatizador de alta performance, projetado com motor de baixo consumo e hélice de perfil aerodinâmico para assegurar excelente vazão de ar e conforto térmico silencioso.',
    'instalacao-acessorios': 'Acessório profissional projetado para infraestrutura e conexões de redes elétricas. Fabricado com materiais de alta durabilidade para garantir passagens, fixações e isolamentos limpos e seguros.'
  };

  const baseDesc = categoryDesc[product.category] || 'Material de padrão profissional, selecionado especialmente para assegurar máxima segurança, durabilidade e desempenho técnico para o seu projeto de obra ou reforma.';
  
  return `${product.name}. ${baseDesc}`;
};

const getCategoryDisplayName = (category: string): string => {
  const mapping: Record<string, string> = {
    'iluminacao': 'Iluminação',
    'fios-cabos': 'Fios e Cabos',
    'tomadas': 'Tomadas e Interruptores',
    'disjuntores': 'Disjuntores e Quadros',
    'ferramentas': 'Ferramentas e Ferragens',
    'ventiladores': 'Ventiladores e Climatização',
    'instalacao-acessorios': 'Acessórios de Instalação'
  };
  return mapping[category] || 'Elétrica';
};

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, e, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const description = getProductDescription(product);
  const categoryName = getCategoryDisplayName(product.category);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col pointer-events-auto hide-scrollbar z-10"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 hover:bg-[#1C2978] text-slate-500 hover:text-white p-2.5 rounded-full z-50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Body */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Left Column: Image Card */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center shrink-0">
            <div className="relative w-full aspect-square max-w-[340px] md:max-w-none bg-[#F9FAFB] rounded-2xl p-4 flex items-center justify-center border border-slate-100 shadow-inner group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
              />
              
              {/* Product Badge Tag */}
              {product.isBestSeller && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#EE4D2D] to-[#FF3B62] text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  Mais Vendido
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title & Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div>
              {/* Category tag */}
              <div className="inline-flex items-center gap-1.5 bg-[#1C2978]/5 border border-[#1C2978]/10 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#1C2978] mb-4">
                <Zap className="w-3.5 h-3.5 text-[#FFD200] fill-[#FFD200]" />
                {categoryName}
              </div>

              {/* Product Name */}
              <h2 className="text-xl md:text-3xl font-display font-extrabold text-[#1C2978] tracking-tight leading-tight mb-3">
                {product.name}
              </h2>

              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-xs md:text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                  Valor sob consulta
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Disponível para Retirada
                </span>
              </div>

              {/* Description box */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2">Descrição do Produto</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {description}
                </p>
              </div>

              {/* Technical specs bullet cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-[#1C2978]/5 flex items-center justify-center text-[#1C2978] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 uppercase font-black leading-none mb-1">Garantia</h5>
                    <p className="text-xs font-bold text-slate-700 leading-none">100% Original c/ Garantia</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-[#1C2978]/5 flex items-center justify-center text-[#1C2978] shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-400 uppercase font-black leading-none mb-1">Retirada</h5>
                    <p className="text-xs font-bold text-slate-700 leading-none">Imediata na Loja Física</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar (Add to cart) */}
            <div className="border-t border-slate-100 pt-6 mt-4 flex flex-col sm:flex-row gap-4 items-center">
              {/* Qty controller */}
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-xl overflow-hidden shadow-inner h-12 w-full sm:w-32 shrink-0">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-full flex items-center justify-center text-[#1C2978] hover:bg-slate-200 transition-colors active:bg-slate-300 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-oswald font-bold text-[#1C2978] w-12 text-center select-none">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-full flex items-center justify-center text-[#1C2978] hover:bg-slate-200 transition-colors active:bg-slate-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full h-12 rounded-xl text-xs md:text-sm font-oswald tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-xl active:scale-[0.98] cursor-pointer relative overflow-hidden ${
                  added 
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white' 
                    : 'bg-gradient-to-b from-[#1C2978] to-[#141F59] hover:from-[#004BE6] hover:to-[#0941B8] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>Adicionado com Sucesso</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform duration-300" /> 
                    <span>Adicionar ao orçamento</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
