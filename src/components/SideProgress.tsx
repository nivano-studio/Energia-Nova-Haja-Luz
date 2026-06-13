import { useState, useEffect } from 'react';

export default function SideProgress() {
  const [progress, setProgress] = useState(0);
  const [isDarkBg, setIsDarkBg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY;
      const currentProgress = (currentScroll / totalHeight) * 100;
      setProgress(currentProgress);

      // Check if we are over the dark section ('sobre' or footer)
      const sobreSection = document.getElementById('sobre');
      if (sobreSection) {
        const rect = sobreSection.getBoundingClientRect();
        // If the top of the 'sobre' section is above the middle of the viewport,
        // we are scrolling into the dark region of the page.
        setIsDarkBg(rect.top <= window.innerHeight / 2);
      } else {
        // Fallback to scroll position threshold
        setIsDarkBg(currentScroll > 1800);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
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
              className="absolute top-0 w-[1.2px] bg-brand-blue transition-all duration-150 rounded-full shadow-[0_0_8px_rgba(28,41,120,0.4)]"
              style={{ height: `${progress}%` }}
            />
            
            {/* Scroll Indicator Dot (Brand Blue) */}
            <div 
              className="absolute w-3 h-3 bg-brand-blue rounded-full shadow-lg border-[1.5px] border-white transition-all duration-150 ease-out z-10"
              style={{ top: `${progress}%`, transform: 'translateY(-50%)' }}
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
