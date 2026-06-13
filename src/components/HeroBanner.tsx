import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const bannerImages = [
  { desktop: "/images/categorias/cabos-fios.webp", mobile: "/images/categorias/cabos-fios.webp", link: "#fios-cabos" },
  { desktop: "/images/categorias/tomadas-interruptores.webp", mobile: "/images/categorias/tomadas-interruptores.webp", link: "#tomadas" },
  { desktop: "/images/categorias/disjuntores.webp", mobile: "/images/categorias/disjuntores.webp", link: "#disjuntores" },
  { desktop: "/images/categorias/ferramentas.webp", mobile: "/images/categorias/ferramentas.webp", link: "#ferramentas" },
  { desktop: "/images/categorias/ferragens-fixacao.webp", mobile: "/images/categorias/ferragens-fixacao.webp", link: "#ferragens-fixacao" },
  { desktop: "/images/categorias/instalacao-acessorios.webp", mobile: "/images/categorias/instalacao-acessorios.webp", link: "#instalacao-acessorios" },
  { desktop: "/images/categorias/iluminacao.webp", mobile: "/images/categorias/iluminacao.webp", link: "#iluminacao" },
  { desktop: "/images/categorias/hidraulicos.webp", mobile: "/images/categorias/hidraulicos.webp", link: "#hidraulicos" }
];

export default function HeroBanner() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const scrollPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const scrollNext = () => {
    setSelectedIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const scrollTo = (index: number) => {
    setSelectedIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="w-full bg-gradient-to-br from-white via-[#F5F7FB] to-[#E8EEF8] pt-12 pb-8 md:pt-10 md:pb-12 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1C2978]/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD200]/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-[1240px] mx-auto px-4 relative flex justify-center items-center">
        
        {/* CAROUSEL */}
        <ScrollReveal 
          delay={0.2} 
          yOffset={20} 
          blur="12px"
          className="w-full max-w-5xl relative group select-none animate-card-stack"
        >
          <div 
            className="relative w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glass frame for carousel */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1C2978]/10 to-[#FFD200]/10 rounded-3xl blur-md"></div>
            
            <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px]">
              {bannerImages.map((banner, index) => {
                const diff = (index - selectedIndex + bannerImages.length) % bannerImages.length;
                const zIndex = diff === 0 ? 30 : diff === 1 ? 20 : 10;
                const cardClass = diff === 0 
                  ? 'card-stack-front' 
                  : diff === 1 
                    ? 'card-stack-middle' 
                    : 'card-stack-back';

                return (
                  <div 
                    key={index} 
                    className={`card-stack-item group rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(28, 41, 120,0.15)] border border-white/40 bg-white cursor-pointer ${cardClass}`}
                    style={{ zIndex }}
                    onMouseMove={handleMouseMove}
                    onClick={() => {
                      if (diff === 0) {
                        const slug = banner.link.replace('#', '');
                        window.dispatchEvent(new CustomEvent('select-product', {
                          detail: { category: slug, subcategory: null }
                        }));
                      } else {
                        scrollTo(index);
                      }
                    }}
                  >
                    {/* Sombra interna leve */}
                    <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.05)]" />

                    <picture className="w-full h-full relative z-10 block">
                      <source media="(max-width: 767px)" srcSet={banner.mobile} />
                      <source media="(min-width: 768px)" srcSet={banner.desktop} />
                      <img
                        src={banner.desktop}
                        alt={`Banner promoção ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </picture>

                    {/* Subtle flashlight effect on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
                      style={{
                        background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 210, 0, 0.15), transparent 45%)'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Setas de navegação (aparecem ao passar o mouse) */}
            <button
              onClick={scrollPrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/35 backdrop-blur-md border border-white/50 flex items-center justify-center text-[#1C2978] hover:bg-[#1C2978] hover:text-white hover:border-[#1C2978] hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_8px_32px_rgba(28, 41, 120,0.06)] group/arrow cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover/arrow:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/35 backdrop-blur-md border border-white/50 flex items-center justify-center text-[#1C2978] hover:bg-[#1C2978] hover:text-white hover:border-[#1C2978] hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_8px_32px_rgba(28, 41, 120,0.06)] group/arrow cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover/arrow:translate-x-0.5 transition-transform" />
            </button>

            {/* Pontinhos de navegação (dots) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-40 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${
                    index === selectedIndex 
                      ? 'w-6 md:w-8 bg-[#FFD200] shadow-[0_0_10px_rgba(255,210,0,0.5)]' 
                      : 'w-1.5 md:w-2 bg-white/50 hover:bg-white/80 hover:scale-110'
                  }`}
                  aria-label={`Ir para o banner ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}


