import { useState } from 'react';
import type { Product } from '../data/products';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onSelectingChange?: (isSelecting: boolean) => void;
}

export default function ProductCard({ product, onSelectingChange }: ProductCardProps) {
  const { addToCart } = useCart();
  const [showQty, setShowQty] = useState(false);
  const [qty, setQty] = useState(1);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!showQty) {
      setShowQty(true);
      setQty(1);
      onSelectingChange?.(true);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQty(false);
    setQty(1);
    onSelectingChange?.(false);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, e, qty);
    setShowQty(false);
    setQty(1);
    onSelectingChange?.(false);
  };


  return (
    <div id={`product-${product.id}`} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/80 hover:border-[#1C2978]/40 flex flex-col h-full overflow-hidden relative hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(28, 41, 120,0.08)] transition-all duration-300 group/card">
      {/* Imagem */}
      <div className="relative aspect-square bg-[#F9FAFB] flex items-center justify-center p-2">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover rounded-md mix-blend-multiply"
        />
        {/* Bottom left overlay tag */}
        {product.isBestSeller && (
          <div className="absolute bottom-0 left-0 bg-gradient-to-r from-[#EE4D2D] to-[#FF3B62] text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-tr-lg shadow-sm z-10">
            Mais Vendido
          </div>
        )}
      </div>

      {/* Conteúdo (Densidade Alta) */}
      <div className="p-2 flex flex-col flex-1 bg-white relative z-20">
        {/* Title */}
        <h3 className="text-[#1C2978] text-[11px] md:text-[12px] font-sans font-semibold tracking-wide leading-[14px] md:leading-[16px] h-[28px] md:h-[32px] line-clamp-2 mb-1 group-hover/card:text-[#1C2978] transition-colors">
          {product.name}
        </h3>
        
        {/* Rating High Density */}
        <div className="flex items-center gap-2 mb-2 mt-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#FFD200] text-[13px] md:text-[15px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">★</span>
            ))}
          </div>
          <div className="flex items-center bg-[#FFD200]/15 border border-[#FFD200]/30 px-1.5 py-0.5 rounded-md">
            <span className="text-[10px] md:text-[11px] font-black text-[#1C2978]">4.8</span>
          </div>
        </div>

        <div className="mb-2">
          <span className="text-[11px] md:text-[12px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Valor sob consulta</span>
        </div>

        {/* Botão de Adicionar - Oculto ou Minimizado */}
        {!showQty ? (
          <button 
            onClick={handleAddClick}
            className="mt-2 w-full bg-gradient-to-b from-white to-slate-50 border border-[#1C2978]/20 text-[#1C2978] hover:border-[#1C2978] hover:from-[#1C2978] hover:to-[#141F59] hover:text-white py-2 rounded-xl text-[10px] md:text-[11px] font-oswald tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_15px_rgba(28, 41, 120,0.25)] active:scale-[0.97] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            <ShoppingCart className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300 relative z-10" /> 
            <span className="relative z-10 whitespace-nowrap">Adicionar ao orçamento</span>
          </button>
        ) : (
          <div className="flex flex-col gap-1.5 mt-2 z-10 bg-white">
            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-lg overflow-hidden shadow-inner">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(Math.max(1, qty - 1)); }}
                className="w-8 h-8 flex items-center justify-center text-[#1C2978] hover:bg-slate-200 transition-colors active:bg-slate-300"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[12px] font-oswald font-bold text-[#1C2978] w-8 text-center">{qty}</span>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(qty + 1); }}
                className="w-8 h-8 flex items-center justify-center text-[#1C2978] hover:bg-slate-200 transition-colors active:bg-slate-300"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-1.5 mt-1">
              <button 
                onClick={handleCancel}
                className="flex-1 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 py-1.5 rounded-lg text-[9px] font-oswald tracking-[0.1em] uppercase transition-all duration-200 active:scale-95"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-b from-[#1C2978] to-[#141F59] hover:from-[#004BE6] hover:to-[#0941B8] text-white py-1.5 rounded-lg text-[9px] font-oswald tracking-[0.1em] uppercase shadow-[0_4px_10px_rgba(28, 41, 120,0.3)] hover:shadow-[0_6px_15px_rgba(28, 41, 120,0.4)] transition-all duration-200 active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
