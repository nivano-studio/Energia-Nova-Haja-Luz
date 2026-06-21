import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabase } from '../contexts/DatabaseContext';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../contexts/CartContext';
import ScrollReveal from '../components/ui/ScrollReveal';
import SpotlightCard from '../components/product/SpotlightCard';

export default function CategoryShowcase() {
  const { products, categories } = useDatabase();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCategory]);

  // Listen for external events (e.g. search)
  useEffect(() => {
    const handleExternalSelect = (e: Event) => {
      const { category, subcategory } = (e as CustomEvent).detail;
      setSelectedCategory(category);
      setSelectedSubcategory(subcategory || null);
    };

    window.addEventListener('select-product', handleExternalSelect);
    return () => window.removeEventListener('select-product', handleExternalSelect);
  }, []);

  // Listen for menu toggle
  useEffect(() => {
    const handleToggleCategories = () => {
      const section = document.getElementById('ofertas');
      if (section) {
        const offset = window.innerWidth < 768 ? 140 : 160;
        const y = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        
        // Highlight effect
        section.classList.add('bg-blue-50');
        setTimeout(() => section.classList.remove('bg-blue-50'), 1000);
      }
    };

    window.addEventListener('toggle-categories', handleToggleCategories);
    return () => window.removeEventListener('toggle-categories', handleToggleCategories);
  }, []);

  const activeCategory = categories.find(c => c.slug === selectedCategory);
  
  const filteredProducts = products.filter(p => {
    if (selectedSubcategory) return p.category === selectedCategory && p.subcategory === selectedSubcategory;
    if (selectedCategory) return p.category === selectedCategory;
    return false;
  });

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (slug: string) => {
    setSelectedSubcategory(selectedSubcategory === slug ? null : slug);
  };

  const closeCategoryScreen = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  return (
    <section id="ofertas" className="py-12 bg-[#f3f4f6]">
      <div className="w-full px-4 md:px-0">
        <ScrollReveal yOffset={15} blur="8px">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#1C2978] mb-8 text-center md:text-left">
            Categorias em Destaque
          </h2>
        </ScrollReveal>
        
        {/* Category Grid (Home View) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <ScrollReveal 
              key={cat.slug} 
              delay={index * 0.05} 
              yOffset={15} 
              blur="8px"
              className="flex w-full"
            >
              <SpotlightCard
                as="button"
                id={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className="category-card-premium w-full cursor-pointer flex"
                glowColor="rgba(28, 41, 120, 0.12)"
                glowSize={240}
                contentClassName="relative z-20 flex flex-col w-full items-center justify-center p-5 text-center h-full"
              >
                <div className="premium-icon-capsule">
                  <cat.icon className="w-7 h-7" />
                </div>
                <h3 className="premium-category-title">
                  {cat.name}
                </h3>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Full Screen Category Overlay using Portal */}
      {createPortal(
        <AnimatePresence>
          {selectedCategory && activeCategory && (
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
                onClick={closeCategoryScreen}
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
            
            {/* Custom Header for Category View */}
            <div className="bg-[#1C2978] text-white px-4 md:px-8 h-16 md:h-20 flex items-center shadow-md flex-shrink-0 w-full relative z-10">
              <div className="flex items-center w-full">
                <button 
                  onClick={closeCategoryScreen}
                  className="mr-3 p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <activeCategory.icon className="w-6 h-6 opacity-80 hidden sm:block flex-shrink-0" />
                  <h2 className="font-bold text-lg md:text-xl truncate">{activeCategory.name}</h2>
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
            <div className="flex-1 overflow-y-auto bg-[#f3f4f6]">
              <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row gap-6 p-4 md:p-8">
                
                {/* Sidebar: Subcategories */}
                <aside className="w-full md:w-72 flex-shrink-0">
                  <div className="md:sticky md:top-4 bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h4 className="text-[#1C2978] font-black text-[10px] uppercase tracking-[0.2em]">Filtrar por</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        {activeCategory.subcategories.length + 1} opções
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setSelectedSubcategory(null)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 text-left group ${
                          !selectedSubcategory 
                            ? 'bg-[#1C2978] text-white shadow-lg shadow-blue-500/20 translate-x-1' 
                            : 'text-[#1C2978] hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-3 text-left">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${!selectedSubcategory ? 'bg-white' : 'bg-slate-300'}`} />
                          Todos os Produtos
                        </span>
                        <ArrowLeft className={`w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all ${!selectedSubcategory ? 'opacity-100' : ''}`} />
                      </button>

                      {activeCategory.subcategories.map(sub => {
                        const isSubActive = selectedSubcategory === sub.slug;
                        const count = products.filter(p => p.category === selectedCategory && p.subcategory === sub.slug).length;
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => handleSubcategoryClick(sub.slug)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 text-left group ${
                              isSubActive 
                                ? 'bg-[#1C2978] text-white shadow-lg shadow-blue-500/20 translate-x-1' 
                                : 'text-[#1C2978] hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-3 text-left">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-white' : 'bg-slate-300 group-hover:bg-[#1C2978]/30'}`} />
                              {sub.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                isSubActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {count}
                              </span>
                              <ArrowLeft className={`w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-all ${isSubActive ? 'opacity-100' : ''}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Desktop category icon badge */}
                    <div className="mt-8 pt-6 border-t border-slate-50 hidden md:block">
                      <div className="flex items-center gap-3 px-2 opacity-40">
                        <activeCategory.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{activeCategory.name}</span>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Main Content: Products Grid */}
                <div className="flex-1 min-w-0">
                  {/* Top bar info */}
                  <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-[#1C2978] rounded-full"></div>
                      <div>
                        <h3 className="text-[#1C2978] font-extrabold text-lg leading-tight">
                          {selectedSubcategory 
                            ? activeCategory.subcategories.find(s => s.slug === selectedSubcategory)?.name 
                            : 'Todos os Produtos'}
                        </h3>
                        <p className="text-[#6B7890] text-[11px] font-bold uppercase tracking-wider">
                          Mostrando {filteredProducts.length} resultados encontrados
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm whitespace-nowrap">
                      ORDERNAR: <span className="text-[#1C2978]">MAIS RELEVANTES</span>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 pb-10">
                      {filteredProducts.map((product, index) => (
                        <div 
                          key={product.id}
                          style={{ animationDelay: `${index * 30}ms` }}
                          className="animate-[fadeInUp_0.5s_ease-out_both]"
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-[32px] shadow-sm border border-slate-100 mx-auto max-w-lg mt-10">
                      <div className="text-5xl mb-6 grayscale opacity-50">📦</div>
                      <h4 className="text-[#1C2978] font-extrabold text-xl mb-2">Em breve novidades</h4>
                      <p className="text-[#6B7890] text-sm px-10 leading-relaxed">
                        Estamos preparando uma seleção especial de produtos nesta categoria para você.
                      </p>
                    </div>
                  )}
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
