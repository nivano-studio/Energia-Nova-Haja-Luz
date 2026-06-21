import { Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { products, categories } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledNav, setIsScrolledNav] = useState(false);
  
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const searchRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nextScrolled = window.scrollY > 20;
          const nextScrolledNav = window.scrollY > 95;
          setIsScrolled(prev => (prev !== nextScrolled ? nextScrolled : prev));
          setIsScrolledNav(prev => (prev !== nextScrolledNav ? nextScrolledNav : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setHoveredCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Normalizar texto removendo acentos para busca
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => normalizeText(p.name).includes(normalizeText(searchQuery))).slice(0, 5);

  const handleProductClick = (productId: string, categorySlug: string, subcategorySlug: string) => {
    setShowSearchResults(false);
    
    window.dispatchEvent(new CustomEvent('select-product', {
      detail: { category: categorySlug, subcategory: subcategorySlug }
    }));

    setTimeout(() => {
      const element = document.getElementById(`product-${productId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-[#1C2978]', 'ring-offset-2', 'transition-all');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-[#1C2978]', 'ring-offset-2');
        }, 2000);
      }
    }, 300);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, categorySlug: string) => {
    e.preventDefault();
    
    // Close dropdown
    setHoveredCategory(null);
    
    // Scroll to section
    window.dispatchEvent(new CustomEvent('select-product', {
      detail: { category: categorySlug, subcategory: null }
    }));
  };

  const handleSubcategoryClick = (categorySlug: string, subcategorySlug: string) => {
    setHoveredCategory(null);
    window.dispatchEvent(new CustomEvent('select-product', {
      detail: { category: categorySlug, subcategory: subcategorySlug }
    }));
  };

  return (
    <div className="w-full h-[104px] md:h-[168px] relative select-none">
      <header className="w-full fixed top-0 left-0 right-0 z-50 flex flex-col">
        {/* TOP WHITE HEADER AREA */}
        <div className={`w-full liquid-glass transition-all duration-300 relative z-50 ${isScrolled ? 'py-1.5 md:py-2 shadow-md border-b border-slate-100/50' : 'py-2 md:py-4'}`}>
          <div className="max-w-[1240px] mx-auto px-4 flex flex-row items-center justify-between gap-3 md:gap-8">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img 
                  src="/images/logos/logo-topo.webp" 
                  alt="Energia Nova Haja Luz" 
                  className={`object-contain origin-left transition-all duration-300 group-hover:scale-105 mix-blend-multiply ${isScrolled ? 'h-8 md:h-12' : 'h-10 md:h-20'}`} 
                />
              </div>
            </div>

            {/* Search */}
            <div ref={searchRef} className="flex-1 min-w-0 max-w-2xl relative">
              <div className="flex w-full relative">
                <input 
                  type="text" 
                  placeholder="Buscar material elétrico..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className={`w-full bg-slate-100/80 md:bg-slate-50 text-slate-800 text-base md:text-sm rounded-full pl-5 pr-14 outline-none border border-slate-200 focus:border-[#1C2978] focus:ring-2 focus:ring-[#1C2978]/20 focus:bg-white transition-all shadow-inner ${isScrolled ? 'py-1.5 md:py-2' : 'py-2.5 md:py-3'}`}
                />
                <button className={`absolute right-1.5 top-1.5 bottom-1.5 bg-[#1C2978] hover:bg-[#004BE6] text-white rounded-full flex items-center justify-center transition-all duration-300 group shadow-md hover:shadow-lg active:scale-95 ${isScrolled ? 'px-3 md:px-4' : 'px-4 md:px-6'}`}>
                  <Search className={`text-white group-hover:scale-110 transition-all duration-300 ${isScrolled ? 'w-3.5 h-3.5 md:w-4 md:h-4' : 'w-4 h-4 md:w-5 md:h-5'}`} />
                </button>
              </div>

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchResults && searchQuery.trim() !== '' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ willChange: "transform, opacity" }}
                    className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md shadow-[0_20px_50px_rgba(28, 41, 120,0.18)] rounded-2xl overflow-hidden z-[60] mt-2 border border-slate-100"
                  >
                    {searchResults.length > 0 ? (
                      <div className="max-h-[300px] overflow-y-auto py-2 hide-scrollbar">
                        {searchResults.map(product => (
                          <div 
                          key={product.id} 
                          className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors group/item relative"
                          onMouseDown={(e) => { e.preventDefault(); handleProductClick(product.id, product.category, product.subcategory); }}
                        >
                          <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-sm border border-slate-100 shrink-0">
                             <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] md:text-sm font-bold text-slate-800 truncate group-hover/item:text-[#1C2978] transition-colors">{product.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 group-hover/item:translate-x-1 transition-transform">Ver detalhes <ChevronDown className="w-3 h-3 -rotate-90" /></p>
                          </div>
                          <div className="divider-gradient absolute bottom-0 left-4 right-4"></div>
                        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-sm font-medium">Nenhum produto encontrado.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Desktop */}
            <div className="hidden md:flex items-center flex-shrink-0 relative z-50">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="group relative inline-flex items-center justify-center p-[1px] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(28, 41, 120,0.12)] rounded-full cursor-pointer bg-transparent"
              >
                {/* Spinning Border Beam (Visible on Hover) */}
                <span className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#1C2978_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"></span>
                {/* Default Static Border */}
                <span className="absolute inset-0 rounded-full bg-slate-200 transition-opacity duration-300 group-hover:opacity-0 z-10"></span>
                {/* Inner Button Content */}
                <span className={`flex items-center gap-3 bg-white hover:bg-[#F5F7FB] rounded-full relative z-20 transition-all duration-300 ${isScrolled ? 'px-4 py-1.5' : 'px-5 py-2.5'}`}>
                  <div className="relative">
                    <ShoppingCart id="cart-icon-desktop" className={`text-[#1C2978] group-hover:scale-110 transition-all duration-300 ${isScrolled ? 'w-4 h-4 md:w-5 md:h-5' : 'w-5 h-5 md:w-6 md:h-6'}`} />
                    {totalItems > 0 && (
                      <span className="absolute -top-2.5 -right-2.5 bg-[#EE4D2D] text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Meu</span>
                    <span className="text-[13px] font-extrabold text-[#1C2978] group-hover:text-[#1C2978] transition-colors">Carrinho</span>
                  </div>
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* BLUE NAVIGATION */}
        <div 
          className={`w-full relative z-40 transition-all duration-500 ease-in-out ${
            isScrolledNav 
              ? 'px-0 my-0 md:px-3 md:my-3' 
              : 'px-0 my-0'
          }`}
        >
          <div 
            className={`mx-auto liquid-glass-blue-pill flex items-center justify-between gap-2 ${
              isScrolledNav 
                ? 'max-w-full md:max-w-[1550px] rounded-none md:rounded-full h-12 md:h-14 px-4 border-x-0 md:border-x-[1.5px] border-t-0 md:border-t-[1.5px]' 
                : 'max-w-full rounded-none h-12 md:h-14 px-4 md:px-8 border-x-0 border-t-0'
            }`}
          >
            
            <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2.5 xl:gap-4 overflow-x-auto md:overflow-visible hide-scrollbar flex-1 h-full">
              {/* Mais vendidos */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const section = document.getElementById('mais-vendidos');
                  if (section) {
                    const offset = window.innerWidth < 768 ? (isScrolledNav ? 110 : 140) : (isScrolledNav ? 130 : 170);
                    const y = section.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-1 bg-[#FFD200] hover:bg-[#F5B500] text-[#1C2978] px-2 md:px-2.5 lg:px-3 xl:px-4 h-8 md:h-9 rounded-full font-bold text-[9px] md:text-[9.5px] lg:text-[10.5px] xl:text-xs flex-shrink-0 transition-all duration-300 shadow-[0_4px_12px_rgba(255,210,0,0.3)] hover:shadow-[0_6px_16px_rgba(255,210,0,0.4)] hover:-translate-y-0.5 group"
              >
                <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:-rotate-12 transition-transform" />
                <span className="inline uppercase tracking-wide">Mais vendidos</span>
                <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Links */}
              <nav ref={navRef} className="flex items-center h-full relative flex-shrink-0">
                {categories.map((cat, index, arr) => (
                  <div 
                    key={cat.slug} 
                    className="flex items-center h-full relative"
                    onMouseEnter={() => setHoveredCategory(cat.slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <a 
                      href={`#${cat.slug}`}
                      onClick={(e) => handleNavClick(e, cat.slug)}
                      className="text-white/90 hover:text-[#FFD200] font-medium text-[9px] md:text-[9.5px] lg:text-[11px] xl:text-[13px] whitespace-nowrap transition-colors px-1 md:px-1.5 lg:px-2 xl:px-3 h-full flex items-center gap-0.5 md:gap-1 relative group/link"
                    >
                      {cat.name.split(' e ')[0]} {cat.name.includes(' e ') ? '& ' + cat.name.split(' e ')[1] : ''}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 opacity-60 group-hover/link:opacity-100 ${hoveredCategory === cat.slug ? 'rotate-180 text-[#FFD200]' : ''}`} />
                      
                      {/* Active line indicator */}
                      <div className={`absolute bottom-0 left-1 right-1 h-0.5 bg-[#FFD200] rounded-t-full transition-transform duration-300 ${hoveredCategory === cat.slug ? 'scale-x-100' : 'scale-x-0'}`}></div>
                    </a>

                    {/* Dropdown Desktop */}
                    <AnimatePresence>
                      {hoveredCategory === cat.slug && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          style={{ willChange: "transform, opacity" }}
                          className={`absolute top-full ${index >= arr.length - 2 ? 'right-0' : 'left-0'} bg-white/98 backdrop-blur-md shadow-[0_20px_50px_rgba(28, 41, 120,0.18)] border border-slate-100 rounded-2xl overflow-y-auto max-h-[calc(100vh-160px)] z-[100] min-w-[260px] py-3 mt-1`}
                        >
                          <div className="px-5 py-2 mb-2">
                            <p className="text-[10px] font-black text-[#1C2978] uppercase tracking-[0.2em]">Subcategorias</p>
                          </div>
                          <div className="divider-gradient"></div>
                          <div className="relative z-10">
                            <div className="py-1">
                          {cat.subcategories.map((sub, i) => (
                            <button
                              key={sub.slug}
                              onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                              className="w-full text-left px-5 py-3 hover:bg-slate-50/50 text-slate-600 hover:text-[#1C2978] font-medium text-sm transition-colors flex items-center justify-between group/sub relative"
                            >
                              <span className="relative z-10 group-hover/sub:translate-x-1 transition-transform duration-300">{sub.name}</span>
                              <div className="w-1.5 h-1.5 rounded-full border border-[#1C2978] group-hover/sub:bg-[#1C2978] transition-colors" />
                              {i < cat.subcategories.length - 1 && <div className="divider-gradient absolute bottom-0 left-5 right-5"></div>}
                            </button>
                          ))}
                          </div>
                          <div className="mt-2 px-3">
                            <button
                              onClick={() => handleNavClick({ preventDefault: () => {} } as React.MouseEvent<HTMLAnchorElement>, cat.slug)}
                              className="w-full text-center py-2.5 bg-slate-50 hover:bg-[#1C2978]/5 text-[#1C2978] font-bold text-[11px] rounded-xl transition-colors uppercase tracking-wider border border-slate-100"
                            >
                              Ver tudo em {cat.name}
                            </button>
                          </div>
                        </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {index < arr.length - 1 && (
                      <span className="w-px h-3 bg-white/20 flex-shrink-0 mx-0.5"></span>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </header>
    </div>
  );
}
