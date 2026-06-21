import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import { useDatabase } from '../contexts/DatabaseContext';
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart, TrendingUp } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import ScrollReveal from '../components/ui/ScrollReveal';

export default function BestSellers() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const { products } = useDatabase();
  const bestSellerProducts = products.filter(p => p.isBestSeller);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide logic with 3s pause
  useEffect(() => {
    if (isPaused || isOverlayOpen || hasInteracted) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bestSellerProducts.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, isOverlayOpen, hasInteracted, bestSellerProducts.length]);

  const itemWidth = typeof window !== 'undefined' && window.innerWidth < 768 ? 176 : 236;

  return (
    <section id="mais-vendidos" className="py-12 bg-[#f3f4f6] overflow-hidden">
      <ScrollReveal blur="12px" yOffset={30} duration={0.7} className="w-full">
        <div className="max-w-[1240px] mx-auto px-4 flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#1C2978]">
              Mais Vendidos
            </h2>
            <span className="bg-[#FFD200] text-[#1C2978] text-[10px] md:text-xs py-1 px-2 rounded font-bold uppercase tracking-wider shadow-sm">
              TOP
            </span>
          </div>
          
          <button 
            onClick={() => setIsOverlayOpen(true)}
            className="text-[#1C2978] font-bold text-sm hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 hover:shadow-md"
          >
            Ver todos
          </button>
        </div>

        {/* Draggable & Stepped Auto-playing Carousel */}
        <div 
          className="relative w-full group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onMouseDown={() => setHasInteracted(true)}
          onTouchStart={() => setHasInteracted(true)}
        >
          {/* Navigation Arrows */}
          <button 
            onClick={() => {
              setHasInteracted(true);
              setCurrentIndex((prev) => (prev - 1 + bestSellerProducts.length) % bestSellerProducts.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-white/35 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(28, 41, 120,0.06)] flex items-center justify-center text-[#1C2978] opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/50 hover:bg-[#1C2978] hover:text-white hover:border-[#1C2978] hover:scale-105 group/arrow cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover/arrow:-translate-x-0.5 transition-transform" />
          </button>
          
          <button 
            onClick={() => {
              setHasInteracted(true);
              setCurrentIndex((prev) => (prev + 1) % bestSellerProducts.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-white/35 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(28, 41, 120,0.06)] flex items-center justify-center text-[#1C2978] opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/50 hover:bg-[#1C2978] hover:text-white hover:border-[#1C2978] hover:scale-105 group/arrow cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover/arrow:translate-x-0.5 transition-transform" />
          </button>

          <motion.div 
            className="flex gap-4 px-4 md:px-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{
              right: 0,
              left: -((bestSellerProducts.length * 3) * itemWidth - (typeof window !== 'undefined' ? window.innerWidth : 1200))
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) setCurrentIndex(prev => (prev + 1) % bestSellerProducts.length);
              if (info.offset.x > 50) setCurrentIndex(prev => (prev - 1 + bestSellerProducts.length) % bestSellerProducts.length);
            }}
            animate={{
              x: -(currentIndex * itemWidth)
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            onDragStart={() => {
              setIsPaused(true);
              setHasInteracted(true);
            }}
            style={{ width: "fit-content" }}
          >
            {/* Using clones to prevent empty space during loop */}
            {[...bestSellerProducts, ...bestSellerProducts, ...bestSellerProducts].map((product, idx) => (
              <div 
                key={`${product.id}-${idx}`} 
                className="w-[160px] md:w-[220px] flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:z-10"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>

          {/* Indicators / Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#f3f4f6] to-transparent z-10 pointer-events-none"></div>
          {/* Indicators / Gradient Overlays */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#f3f4f6] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#f3f4f6] to-transparent z-10 pointer-events-none"></div>
        </div>
      </ScrollReveal>

      {/* Full Screen Overlay using Portal */}
      {createPortal(
        <AnimatePresence>
          {isOverlayOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ willChange: "transform, opacity" }}
              className="fixed inset-0 z-[9999] flex flex-col"
            >
              {/* Backdrop com Blur */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ willChange: "opacity" }}
                className="absolute inset-0 bg-[#1C2978]/60 backdrop-blur-md"
                onClick={() => setIsOverlayOpen(false)}
              />
              
              {/* Full Screen Content Card */}
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ willChange: "transform" }}
                className="relative w-full h-full bg-[#f3f4f6] flex flex-col overflow-hidden"
              >
            
            {/* Custom Header for Overlay View */}
            <div className="bg-[#1C2978] text-white px-4 md:px-8 h-16 md:h-20 flex items-center shadow-md flex-shrink-0 w-full relative z-10">
              <div className="flex items-center w-full">
                <button 
                  onClick={() => setIsOverlayOpen(false)}
                  className="mr-3 p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <TrendingUp className="w-6 h-6 opacity-80 hidden sm:block flex-shrink-0" />
                  <div>
                    <h2 className="font-bold text-lg md:text-xl truncate">Mais Vendidos</h2>
                    <p className="text-[10px] md:text-xs text-blue-100 font-medium uppercase tracking-wider opacity-70">Confira o que está em alta</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-white hover:bg-white/20 rounded-full transition-colors ml-2 flex-shrink-0"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full border border-[#1C2978]">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 md:px-20 pt-0 bg-[#f3f4f6]">
              <div className="w-full py-8">
                {/* Status Bar */}
                <div className="mb-8 flex justify-between items-center text-[#6B7890] text-sm font-semibold tracking-wide">
                  <span className="bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Mostrando os {bestSellerProducts.length} itens mais populares
                  </span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 md:gap-4">
                  {bestSellerProducts.map((product) => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translate3d(0, 30px, 0) scale(0.98); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 20px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </section>
  );
}
