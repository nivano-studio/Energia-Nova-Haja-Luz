import { useState, useEffect, useRef } from 'react';

export default function SideProgress() {
  const [isDarkBg, setIsDarkBg] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to watch when dark sections enter the top 50% of the screen
  useEffect(() => {
    const sobreSection = document.getElementById('sobre');
    const footerSection = document.querySelector('footer');
    
    const activeElements = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activeElements.add(entry.target);
          } else {
            activeElements.delete(entry.target);
          }
        });
        setIsDarkBg(activeElements.size > 0);
      },
      {
        rootMargin: '0px 0px -50% 0px',
      }
    );

    if (sobreSection) observer.observe(sobreSection);
    if (footerSection) observer.observe(footerSection);

    return () => observer.disconnect();
  }, []);

  // Direct DOM updates for progress fill and indicator dot with cached height to avoid layout thrashing
  useEffect(() => {
    let ticking = false;
    let totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    const handleResize = () => {
      totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (totalHeight > 0) {
            const currentScroll = window.scrollY;
            const percentage = Math.min(1, Math.max(0, currentScroll / totalHeight));
            
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleY(${percentage})`;
            }
            if (dotRef.current) {
              // Position dot in middle of track container (80px height)
              dotRef.current.style.transform = `translateX(-50%) translateY(${percentage * 80}px) translateY(-50%)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Run once initially
    handleScroll();

    // Recalculate after 1s once dynamic product grid finishes rendering
    const timer = setTimeout(handleResize, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed right-0 top-[55%] -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center pointer-events-none">
      <div className="flex flex-col items-center pointer-events-auto">
        {/* Scroll Progress Section */}
        <div className="relative py-4 flex flex-col items-center w-10">
          
          {/* Label "ROLAR" with dynamic color transition */}
          <span 
            className={`text-[9px] font-black uppercase tracking-[0.2em] mb-4 select-none transition-colors duration-500 ${
              isDarkBg ? 'text-white' : 'text-brand-blue'
            }`} 
            style={{ writingMode: 'vertical-rl' }}
          >
            ROLAR
          </span>
          
          {/* Scrollbar Line & Dot */}
          <div className="relative w-10 h-20 flex justify-center">
            {/* Scroll Track Line */}
            <div 
              className={`w-[1.2px] h-full rounded-full transition-colors duration-500 ${
                isDarkBg ? 'bg-white/30' : 'bg-brand-blue/10'
              }`} 
            />
            
            {/* Scroll Fill Line (Brand Blue) */}
            <div 
              ref={fillRef}
              className="absolute top-0 w-[1.2px] bg-brand-blue rounded-full shadow-[0_0_8px_rgba(28,41,120,0.4)] origin-top"
              style={{ height: '100%', transform: 'scaleY(0)' }}
            />
            
            {/* Scroll Indicator Dot (Brand Blue) */}
            <div 
              ref={dotRef}
              className="absolute w-3 h-3 bg-brand-blue rounded-full shadow-lg border-[1.5px] border-white z-10 top-0 left-1/2"
              style={{ transform: 'translateX(-50%) translateY(0px) translateY(-50%)' }}
            />
          </div>
        </div>

        {/* Nivano Studio Credits Badge (Adapted to Blue & Yellow visual identity) */}
        <a 
          href="https://www.instagram.com/nivanostudio/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-brand-blue-secondary hover:bg-brand-blue transition-all duration-300 w-10 py-6 flex flex-col items-center gap-1 group no-underline rounded-l-xl shadow-2xl border-l border-white/10"
        >
          <span 
            className="text-white/60 text-[7px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-transform duration-500 group-hover:scale-105"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            DESENVOLVIDO PELA
          </span>
          <span 
            className="text-white group-hover:text-white text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap mt-0.5 transition-all duration-500 group-hover:scale-110 font-display"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            NIVANO STUDIO
          </span>
        </a>
      </div>
    </div>
  );
}
